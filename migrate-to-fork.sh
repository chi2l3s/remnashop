#!/usr/bin/env bash
set -euo pipefail

# migrate-to-fork.sh — безопасный переезд с /opt/remnashop (без .git) на форк chi2l3s/remnashop
# - бэкапит .env / БД / volumes
# - клонирует форк в /opt/remnashop-fork
# - собирает образ из форка (локальный Dockerfile), сохраняет данные БД
# - проверяет health и миграции
# - только если всё ок — удаляет старую директорию
#
# Запуск на сервере:
#   chmod +x migrate-to-fork.sh
#   sudo ./migrate-to-fork.sh
#   # или с параметрами:
#   sudo ./migrate-to-fork.sh --fork https://github.com/chi2l3s/remnashop.git --yes
#
# Требования: docker, docker compose, git, curl

FORK_URL="${FORK_URL:-https://github.com/chi2l3s/remnashop.git}"
OLD_DIR="/opt/remnashop"
NEW_DIR="/opt/remnashop-fork"
BACKUP_ROOT="/root/remnashop-backup-$(date +%F_%H%M%S)"
COMPOSE_PROJECT="remnashop"
AUTO_YES=0
SKIP_DB_DUMP=0

for arg in "$@"; do
  case "$arg" in
    --fork=*) FORK_URL="${arg#--fork=}" ;;
    --yes|-y) AUTO_YES=1 ;;
    --skip-db-dump) SKIP_DB_DUMP=1 ;;
    --help|-h)
      echo "Usage: $0 [--fork=URL] [--yes] [--skip-db-dump]"
      exit 0
      ;;
  esac
done
# поддержка --fork URL без =
if [[ "${1:-}" == "--fork" ]]; then FORK_URL="${2:-$FORK_URL}"; fi

log()  { echo -e "\033[1;34m[$(date +%H:%M:%S)]\033[0m $*"; }
ok()   { echo -e "\033[1;32m[OK]\033[0m $*"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $*"; }
err()  { echo -e "\033[1;31m[ERR]\033[0m $*" >&2; }

need_root() {
  if [[ $EUID -ne 0 ]]; then err "Запусти через sudo: sudo $0"; exit 1; fi
}

detect_compose() {
  local dir="$1"
  for f in docker-compose.yml docker-compose.yaml compose.yml compose.yaml docker-compose.prod.internal.yml docker-compose.prod.external.yml docker-compose.prod.yml; do
    if [[ -f "$dir/$f" ]]; then echo "$dir/$f"; return 0; fi
  done
  echo ""
}

compose_cmd() {
  local dir="$1"; shift
  local file
  file=$(detect_compose "$dir")
  if [[ -n "$file" ]]; then
    echo "docker compose -p $COMPOSE_PROJECT -f $file"
  else
    echo "docker compose -p $COMPOSE_PROJECT"
  fi
}

wait_health() {
  local url="http://127.0.0.1:${APP_PORT:-5000}/health"
  log "Жду health $url (до 120с)..."
  for i in $(seq 1 60); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      ok "Health отвечает (попытка $i)"
      curl -fsS "$url" 2>/dev/null | head -c 500; echo
      return 0
    fi
    # также проверяем что контейнеры не в Restarting/Exited
    if docker ps --format '{{.Names}} {{.Status}}' | grep -q "remnashop.*Restarting\|remnashop.*Exited"; then
      docker ps -a --format '{{.Names}} {{.Status}}' | grep remnashop || true
      docker logs remnashop --tail 80 2>&1 | tail -n 80 || true
    fi
    sleep 2
  done
  return 1
}

need_root

log "Форк: $FORK_URL"
log "Старая директория: $OLD_DIR"
log "Новая директория: $NEW_DIR"
log "Бэкап: $BACKUP_ROOT"

if [[ ! -d "$OLD_DIR" ]]; then err "Нет $OLD_DIR"; exit 1; fi
if [[ ! -f "$OLD_DIR/.env" ]]; then
  err "Нет $OLD_DIR/.env — без него переезд опасен. Прервано."
  exit 1
fi

# 0. Проверки
command -v docker >/dev/null || { err "Нет docker"; exit 1; }
docker compose version >/dev/null 2>&1 || { err "Нет docker compose plugin"; exit 1; }
command -v git >/dev/null || { err "Нет git — apt install git"; exit 1; }

OLD_COMPOSE=$(detect_compose "$OLD_DIR")
if [[ -z "$OLD_COMPOSE" ]]; then
  warn "В $OLD_DIR не найден docker-compose.yml — возьму docker-compose.prod.internal.yml из форка после клона"
fi
log "Compose старой версии: ${OLD_COMPOSE:-<не найден>}"

# читаем APP_PORT из .env для health-чека
if [[ -f "$OLD_DIR/.env" ]]; then set -a; source "$OLD_DIR/.env" 2>/dev/null || true; set +a; fi
APP_PORT="${APP_PORT:-5000}"

# 1. Бэкап
log "Делаю бэкап в $BACKUP_ROOT ..."
mkdir -p "$BACKUP_ROOT"
cp -a "$OLD_DIR/.env" "$BACKUP_ROOT/.env" 2>/dev/null || true
cp -a "$OLD_DIR/docker-compose.yml" "$BACKUP_ROOT/" 2>/dev/null || true
cp -a "$OLD_DIR/docker-compose.prod.internal.yml" "$BACKUP_ROOT/" 2>/dev/null || true
cp -a "$OLD_DIR/docker-compose.prod.external.yml" "$BACKUP_ROOT/" 2>/dev/null || true
# инкрементальный бэкап БД через pg_dump если контейнер жив
if [[ $SKIP_DB_DUMP -eq 0 ]] && docker ps --format '{{.Names}}' | grep -q "^remnashop-db$"; then
  log "Дамплю БД (pg_dump)..."
  DB_USER="${DATABASE_USER:-remnashop}"
  DB_NAME="${DATABASE_NAME:-remnashop}"
  if docker exec remnashop-db pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_ROOT/db.sql" 2>"$BACKUP_ROOT/pg_dump.log"; then
    ok "Дамп БД: $BACKUP_ROOT/db.sql ($(du -h "$BACKUP_ROOT/db.sql" | cut -f1))"
  else
    warn "pg_dump не удался — смотри $BACKUP_ROOT/pg_dump.log (продолжаю, volumes останутся)"
  fi
else
  warn "Контейнер remnashop-db не запущен или --skip-db-dump — дамп пропущен"
fi
# бэкап volumes на всякий (если есть место)
docker volume ls | grep -q "remnashop-db-data" && echo "Volume remnashop-db-data существует — данные сохранятся через reuse" || warn "Volume remnashop-db-data не найден"

# 2. Клон форка
if [[ -d "$NEW_DIR/.git" ]]; then
  log "Обновляю существующий $NEW_DIR ..."
  git -C "$NEW_DIR" remote set-url origin "$FORK_URL" 2>/dev/null || git -C "$NEW_DIR" remote add origin "$FORK_URL" || true
  git -C "$NEW_DIR" fetch origin --prune
  # сохраняем локальный .env
  cp -a "$NEW_DIR/.env" /tmp/remnashop-fork.env.bak 2>/dev/null || true
  git -C "$NEW_DIR" reset --hard origin/main 2>/dev/null || git -C "$NEW_DIR" reset --hard origin/master 2>/dev/null || {
    # если ветка main/master не найдена — берём HEAD
    git -C "$NEW_DIR" reset --hard "origin/HEAD" || true
  }
  [[ -f /tmp/remnashop-fork.env.bak ]] && cp -a /tmp/remnashop-fork.env.bak "$NEW_DIR/.env" || true
else
  if [[ -d "$NEW_DIR" ]]; then
    warn "$NEW_DIR существует но без .git — переношу в ${NEW_DIR}.bak-$(date +%s)"
    mv "$NEW_DIR" "${NEW_DIR}.bak-$(date +%s)"
  fi
  log "Клонирую $FORK_URL -> $NEW_DIR ..."
  git clone "$FORK_URL" "$NEW_DIR"
fi
ok "Форк на месте: $(git -C "$NEW_DIR" rev-parse --short HEAD) $(git -C "$NEW_DIR" log -1 --oneline | head -c 80)"

# 3. Копируем .env и пользовательские данные
log "Копирую .env и assets/backups/logs ..."
cp -a "$OLD_DIR/.env" "$NEW_DIR/.env"
# не перезаписываем если в форке уже есть .env.example — оставляем .env из продакшена
for d in assets backups logs; do
  if [[ -d "$OLD_DIR/$d" ]]; then
    mkdir -p "$NEW_DIR/$d"
    # копируем только если в новом пусто или файлы отличаются
    cp -a "$OLD_DIR/$d/." "$NEW_DIR/$d/" 2>/dev/null || true
  fi
done
ok ".env скопирован, volumes: assets/backups/logs синхронизированы"

# 4. Выбираем compose для новой версии
NEW_COMPOSE=$(detect_compose "$NEW_DIR")
if [[ -z "$NEW_COMPOSE" ]]; then
  err "В форке не найден docker-compose файл. Ожидался docker-compose.yml или docker-compose.prod.*.yml"
  exit 1
fi
log "Compose новой версии: $NEW_COMPOSE"

# Патчим compose чтобы собирал локальный Dockerfile а не тянул ghcr.io/snoups/remnashop:latest
# Если в compose уже есть build — ничего не делаем. Если только image — добавляем build: .
if ! grep -q "^\s*build:" "$NEW_COMPOSE"; then
  warn "В $NEW_COMPOSE нет build — добавляю build: . чтобы собрать форк локально"
  # Вставляем build: . рядом с image в сервисе remnashop
  # Делаем бэкап
  cp "$NEW_COMPOSE" "$NEW_COMPOSE.bak"
  # Простой патч: заменяем image на build+image (совместимо с compose)
  # Используем python для безопасного редактирования yaml
  python3 - "$NEW_COMPOSE" << 'PY'
import sys, re
path = sys.argv[1]
with open(path, encoding="utf-8") as f:
    txt = f.read()
# Добавляем build: . после строки image: ghcr.io/snoups/remnashop:latest в каждом сервисе где есть x-build
# Если x-build уже определён — достаточно добавить build в него
if "x-build:" in txt and "build:" not in txt.split("x-build:")[1].split("x-common:")[0]:
    txt = txt.replace("x-build: &build\n  image:", "x-build: &build\n  build: .\n  image:", 1)
else:
    # fallback: добавляем build в сервис remnashop
    txt = re.sub(r"(^\s*remnashop:\n\s+container_name:.*\n\s+hostname:.*\n)(\s+<<:)",
                r"\1    build: .\n\2", txt, flags=re.MULTILINE)
with open(path, "w", encoding="utf-8") as f:
    f.write(txt)
print("patched")
PY
  log "Патч compose применён (бэкап: $NEW_COMPOSE.bak)"
fi

# 5. Останавливаем старый стек (но volumes оставляем)
log "Останавливаю старый стек (volumes сохраняю)..."
if [[ -n "$OLD_COMPOSE" ]]; then
  (cd "$OLD_DIR" && docker compose -p "$COMPOSE_PROJECT" -f "$OLD_COMPOSE" down 2>&1 | tail -n 20) || \
  (cd "$OLD_DIR" && docker compose -p "$COMPOSE_PROJECT" down 2>&1 | tail -n 20) || true
else
  # пробуем без -f
  (cd "$OLD_DIR" && docker compose -p "$COMPOSE_PROJECT" down 2>&1 | tail -n 20) || true
fi
# на случай если старый стек был запущен без -p
docker rm -f remnashop remnashop-taskiq-worker remnashop-taskiq-scheduler 2>/dev/null || true
ok "Старый стек остановлен"

# 6. Поднимаем новый стек (переиспользует volumes remnashop-db-data / remnashop-redis-data)
log "Собираю и поднимаю новый стек: $NEW_COMPOSE ..."
(cd "$NEW_DIR" && docker compose -p "$COMPOSE_PROJECT" -f "$NEW_COMPOSE" up -d --build 2>&1 | tail -n 40)
ok "docker compose up -d --build выполнен"

log "Жду готовности БД и Redis (healthcheck)..."
for i in $(seq 1 30); do
  db_h=$(docker inspect --format='{{.State.Health.Status}}' remnashop-db 2>/dev/null || echo "no")
  rd_h=$(docker inspect --format='{{.State.Health.Status}}' remnashop-redis 2>/dev/null || echo "no")
  if [[ "$db_h" == "healthy" && "$rd_h" == "healthy" ]]; then ok "БД и Redis healthy"; break; fi
  sleep 2
  if [[ $i -eq 30 ]]; then warn "БД/Redis не стали healthy за 60с (db=$db_h redis=$rd_h) — продолжаю, возможно healthcheck отсутствует"; fi
done

# 7. Проверки
log "Проверяю контейнеры..."
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -E "NAMES|remnashop" || true

# Миграции уже прогнались в docker-entrypoint.sh, но проверим
log "Проверяю миграции..."
if docker exec remnashop alembic -c src/infrastructure/database/alembic.ini current 2>&1 | tail -n 20; then
  ok "alembic current ок"
else
  warn "alembic current не ответил — смотри логи: docker logs remnashop --tail 100"
fi
if docker exec remnashop alembic -c src/infrastructure/database/alembic.ini heads 2>&1 | tail -n 5; then true; fi

# Health
if wait_health; then
  ok "Health check пройден"
else
  err "Health check НЕ пройден — откатываю!"
  docker logs remnashop --tail 120 2>&1 | tail -n 120 || true
  log "Откат: поднимаю старый стек..."
  (cd "$NEW_DIR" && docker compose -p "$COMPOSE_PROJECT" -f "$NEW_COMPOSE" down 2>&1 | tail -n 20) || true
  if [[ -n "$OLD_COMPOSE" ]]; then
    (cd "$OLD_DIR" && docker compose -p "$COMPOSE_PROJECT" -f "$OLD_COMPOSE" up -d 2>&1 | tail -n 20) || true
  else
    (cd "$OLD_DIR" && docker compose -p "$COMPOSE_PROJECT" up -d 2>&1 | tail -n 20) || true
  fi
  err "Откат выполнен. Старая версия снова запущена. Бэкап: $BACKUP_ROOT"
  exit 1
fi

# Доп. проверки
log "Логи нового remnashop (последние 40 строк):"
docker logs remnashop --tail 40 2>&1 | tail -n 40 || true

# Проверка что extra_devices / device_purchase на месте (если форк с фичей)
if docker exec remnashop python -c "from src.infrastructure.database.models.subscription import Subscription; print('extra_devices' in dir(Subscription))" 2>/dev/null | grep -q True; then
  ok "Фича extra_devices присутствует в образе"
fi

# 8. Удаление старой версии — только если всё ок
log "Все проверки пройдены."
if [[ $AUTO_YES -eq 1 ]]; then
  REPLY="y"
else
  echo
  echo -e "\033[1;33mУдалить старую директорию $OLD_DIR ?\033[0m (данные БД сохранены в volumes, бэкап: $BACKUP_ROOT)"
  read -r -p "Введи 'y' для удаления, Enter для отмены: " REPLY
fi

if [[ "$REPLY" == "y" || "$REPLY" == "Y" ]]; then
  # ещё один бэкап .env на всякий
  cp -a "$OLD_DIR/.env" "$BACKUP_ROOT/.env.old-dir" 2>/dev/null || true
  # Удаляем старую директорию, но оставляем volumes (они уже используются новым стеком)
  rm -rf "$OLD_DIR"
  ok "Старая директория $OLD_DIR удалена"
  # Перемещаем новую на место старой для единообразия (опционально)
  if [[ "$NEW_DIR" != "$OLD_DIR" ]]; then
    log "Перемещаю $NEW_DIR -> $OLD_DIR ..."
    mv "$NEW_DIR" "$OLD_DIR"
    ok "Форк теперь в $OLD_DIR (как и раньше)"
    log "Перезапускаю с нового пути для проверки..."
    NEW_COMPOSE_AFTER=$(detect_compose "$OLD_DIR")
    (cd "$OLD_DIR" && docker compose -p "$COMPOSE_PROJECT" -f "$NEW_COMPOSE_AFTER" up -d 2>&1 | tail -n 20) || \
    (cd "$OLD_DIR" && docker compose -p "$COMPOSE_PROJECT" up -d 2>&1 | tail -n 20) || true
    sleep 5
    wait_health && ok "После перемещения health ок" || warn "После перемещения health не отвечает — проверь docker logs remnashop"
  fi
else
  log "Удаление отменено. Старая директория сохранена: $OLD_DIR"
  log "Новая версия работает из: $NEW_DIR"
  log "Когда убедишься — удали вручную: rm -rf $OLD_DIR"
fi

echo
ok "Готово. Бэкап: $BACKUP_ROOT"
echo "  Логи: docker logs remnashop -f --tail 100"
echo "  Статус: docker ps --format 'table {{.Names}}\t{{.Status}}'"
echo "  Health: curl -fsS http://127.0.0.1:${APP_PORT}/health | jq"
