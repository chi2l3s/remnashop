# Инструкция по применению изменений

## Установка зависимостей

```bash
# Установить зависимости проекта (если еще не установлены)
uv sync

# Или через pip
pip install -r requirements.txt
```

## Применение миграций базы данных

```bash
# Применить все новые миграции
alembic upgrade head

# Проверить текущую версию
alembic current

# Откат (если нужно)
alembic downgrade -1
```

## Проверка изменений

### 1. Проверка структуры базы данных

После применения миграций проверьте, что созданы:

```sql
-- Таблица device_purchases
SELECT * FROM device_purchases LIMIT 1;

-- Поле extra_devices в subscriptions
SELECT id, device_limit, extra_devices FROM subscriptions LIMIT 1;

-- Настройки device_purchase в settings
SELECT extra->'device_purchase' FROM settings;
```

### 2. Проверка кода

```bash
# Проверка синтаксиса
python -m ruff check src/

# Проверка типов (если установлен mypy)
python -m mypy src/
```

### 3. Тестовый пример использования

Создайте файл `test_device_purchase.py`:

```python
import asyncio
from decimal import Decimal

from src.application.use_cases.subscription.commands.purchase_devices import (
    PurchaseDevices,
    PurchaseDevicesDto,
)
from src.core.enums import Currency

# Предполагается, что у вас уже есть:
# - настроенный DI контейнер
# - пользователь (user)
# - активная подписка (subscription)

async def test_purchase():
    # Получить use case через DI
    purchase_devices = await container.get(PurchaseDevices)
    
    # Создать данные для покупки
    purchase_data = PurchaseDevicesDto(
        user=user,
        subscription=subscription,
        devices_count=3,
        price_per_device=Decimal("500"),
        currency=Currency.RUB,
        payment_id="test_payment_123",
    )
    
    # Выполнить покупку
    purchase = await purchase_devices(actor=user, data=purchase_data)
    
    print(f"✅ Успешно куплено {purchase.devices_added} устройств")
    print(f"💰 Стоимость: {purchase.total_price} {purchase.currency}")
    
    # Проверить обновление подписки
    updated_sub = await subscription_dao.get_by_id(subscription.id)
    print(f"📱 Всего устройств: {updated_sub.total_device_limit}")
    print(f"   Базовых: {updated_sub.device_limit}")
    print(f"   Докупленных: {updated_sub.extra_devices}")

if __name__ == "__main__":
    asyncio.run(test_purchase())
```

## Конфигурация цен

### Через код (при старте приложения)

```python
from src.core.enums import Currency

settings = await settings_dao.get()

# Установить цены
settings.extra.device_purchase.prices = {
    Currency.USD: 10,    # $10 за устройство
    Currency.RUB: 1000,  # 1000₽ за устройство  
    Currency.XTR: 100,   # 100★ за устройство
}

await settings_dao.update(settings)
```

### Через SQL (напрямую в БД)

```sql
UPDATE settings
SET extra = jsonb_set(
    extra,
    '{device_purchase,prices}',
    '{"USD": 10, "RUB": 1000, "XTR": 100}'::jsonb
);
```

### Через админ-панель

После реализации UI в админ-панели цены можно будет настраивать через интерфейс.

## Проверка работы с Remnawave

После покупки устройств проверьте, что изменения синхронизировались с панелью Remnawave:

```python
# Получить пользователя из Remnawave
remna_user = await remnawave.get_user_by_uuid(subscription.user_remna_id)

print(f"Device limit в Remnawave: {remna_user.hwid_device_limit}")
print(f"Device limit в нашей БД: {subscription.total_device_limit}")

# Они должны совпадать!
assert remna_user.hwid_device_limit == subscription.total_device_limit
```

## Отладка проблем

### Проблема: Миграция не применяется

```bash
# Проверить статус миграций
alembic history

# Проверить текущую версию
alembic current

# Применить конкретную миграцию
alembic upgrade 0041
```

### Проблема: Настройки не инициализируются

```sql
-- Проверить существование настроек
SELECT id, extra->'device_purchase' FROM settings;

-- Если настроек нет, добавить вручную
UPDATE settings
SET extra = extra || '{"device_purchase": {"enabled": true, "prices": {"USD": 5, "RUB": 500, "XTR": 50}}}'::jsonb
WHERE NOT (extra ? 'device_purchase');
```

### Проблема: extra_devices не сохраняется

Убедитесь, что поле добавлено в модель:

```sql
-- Проверить структуру таблицы
\d subscriptions;

-- Поле extra_devices должно присутствовать
```

### Проблема: total_device_limit не обновляется в Remnawave

Проверьте, что изменения в `remnawave.py` применены:

```python
# В _build_create_request и _build_update_request должно быть:
hwid_device_limit=subscription.total_device_limit
# А НЕ:
hwid_device_limit=subscription.device_limit
```

## Следующие шаги

1. ✅ Применить миграции
2. ✅ Настроить цены
3. ✅ Протестировать покупку через Python API
4. 🔄 Реализовать UI в телеграм-боте
5. 🔄 Интегрировать с платежными шлюзами
6. 🔄 Добавить админ-панель для управления ценами

## Полезные команды

```bash
# Откатить все миграции (ОСТОРОЖНО!)
alembic downgrade base

# Откатить до конкретной версии
alembic downgrade 0040

# Создать новую миграцию (если нужно что-то добавить)
alembic revision -m "your_description"

# Проверить SQL который будет выполнен
alembic upgrade 0041 --sql

# Запустить линтер
ruff check src/

# Автоматически исправить стиль кода
ruff check src/ --fix
```

## Контакты и поддержка

Если возникли проблемы с интеграцией, проверьте:

1. Логи приложения
2. Логи базы данных
3. Логи Remnawave панели
4. [DEVICE_PURCHASE_FEATURE.md](./DEVICE_PURCHASE_FEATURE.md) - подробная документация
5. [SUMMARY.md](./SUMMARY.md) - сводка изменений
