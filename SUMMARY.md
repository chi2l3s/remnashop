# Сводка изменений - Функция докупки устройств

## ✅ Реализовано

### Backend (Core)

1. **Модели базы данных**
   - ✅ `DevicePurchase` - таблица истории покупок устройств
   - ✅ `Subscription.extra_devices` - поле для хранения количества докупленных устройств
   
2. **DTO (Data Transfer Objects)**
   - ✅ `DevicePurchaseDto` - DTO для покупки устройств
   - ✅ `DevicePurchaseSettingsDto` - настройки цен для разных валют
   - ✅ `SubscriptionDto.total_device_limit` - свойство для общего количества устройств

3. **DAO (Data Access Objects)**
   - ✅ `DevicePurchaseDao` (Protocol) - интерфейс
   - ✅ `DevicePurchaseDaoImpl` - реализация с использованием adaptix

4. **Use Cases**
   - ✅ `PurchaseDevices` - бизнес-логика покупки устройств
   - ✅ Обновлена логика `PurchaseSubscription` для сохранения extra_devices при обновлении

5. **Сервисы**
   - ✅ `RemnawaveImpl` - обновлены методы создания/обновления для использования total_device_limit

6. **Настройки**
   - ✅ Добавлен `device_purchase` в `SettingsDto` с ценами для каждой валюты

7. **Dependency Injection**
   - ✅ Зарегистрирован `DevicePurchaseDao` в DI контейнере

8. **Миграции базы данных**
   - ✅ `0041_add_device_purchases.py` - создание таблицы и поля
   - ✅ `0042_add_device_purchase_settings.py` - инициализация настроек

## 🔄 Как работает

```
1. Пользователь покупает устройства через PurchaseDevices
   ↓
2. extra_devices += количество
   ↓
3. Обновление в Remnawave с total_device_limit (базовые + докупленные)
   ↓
4. Сохранение в БД + запись в device_purchases
   ↓
5. При продлении подписки:
   - device_limit обновляется из нового плана
   - extra_devices сохраняется БЕЗ изменений ✨
   - В Remnawave снова отправляется total_device_limit
```

## ✅ Интеграция (выполнено)

### Telegram Bot UI
- [x] Кнопка "Докупить устройства" в меню подписки (видна при активной подписке,
      включенной фиче и настроенной цене хотя бы для одной валюты шлюза)
- [x] Диалог выбора количества устройств (1/2/3/5/10) с ценой в валюте по умолчанию
- [x] Выбор способа оплаты из активных шлюзов (цена за валю шлюза берется из настроек)
- [x] Интеграция с платежными шлюзами через существующий CreatePayment/ProcessPayment
      (PurchaseType.DEVICES + devices_count в транзакции)
- [x] Окно успешной покупки (Subscription.DEVICES_SUCCESS) и redirect после оплаты
- [x] Событие event-subscription.devices для уведомлений/вебхуков
- [x] Бесплатная "докупка" при 100% скидке через ProcessPayment

### Admin Panel (Telegram)
- [x] Раздел "Докупка устройств" в Dashboard → Remnashop → Доп. настройки
- [x] Включение/выключение функции кнопкой
- [x] Настройка цены за устройство для XTR / RUB / USD через кнопки и ввод сообщения
- [x] Use cases ToggleDevicePurchase / UpdateDevicePurchasePrice

### Не реализовано (вне рамок задачи)
- [ ] История/статистика покупок устройств в админке (данные пишутся в device_purchases)
- [ ] API Endpoints для web-кабинета

## 🧪 Тестирование

Для тестирования функциональности:

```python
# 1. Применить миграции
alembic upgrade head

# 2. Проверить создание покупки
from src.application.use_cases.subscription.commands.purchase_devices import (
    PurchaseDevices, PurchaseDevicesDto
)

purchase_data = PurchaseDevicesDto(
    user=user,
    subscription=subscription,
    devices_count=3,
    price_per_device=Decimal("500"),
    currency=Currency.RUB,
)

purchase = await purchase_devices_use_case(actor=user, data=purchase_data)

# 3. Проверить, что total_device_limit обновился
assert subscription.total_device_limit == subscription.device_limit + 3

# 4. Продлить подписку и проверить сохранение extra_devices
# ... (выполнить PurchaseSubscription с type=RENEW)

# 5. Проверить историю
purchases = await device_purchase_dao.get_by_subscription(subscription.id)
```

## 📁 Измененные/Созданные файлы

### Созданные:
- `src/application/dto/device_purchase.py`
- `src/application/common/dao/device_purchase.py`
- `src/infrastructure/database/dao/device_purchase.py`
- `src/infrastructure/database/models/device_purchase.py`
- `src/application/use_cases/subscription/commands/purchase_devices.py`
- `src/infrastructure/database/migrations/versions/0041_add_device_purchases.py`
- `src/infrastructure/database/migrations/versions/0042_add_device_purchase_settings.py`
- `DEVICE_PURCHASE_FEATURE.md`

### Модифицированные:
- `src/application/dto/subscription.py` - добавлено extra_devices и total_device_limit
- `src/application/dto/settings.py` - добавлен DevicePurchaseSettingsDto
- `src/infrastructure/database/models/subscription.py` - добавлено поле extra_devices
- `src/infrastructure/services/remnawave.py` - использование total_device_limit
- `src/application/use_cases/subscription/commands/purchase.py` - сохранение extra_devices
- `src/application/dto/__init__.py` - экспорт DevicePurchaseDto
- `src/application/common/dao/__init__.py` - экспорт DevicePurchaseDao
- `src/infrastructure/database/dao/__init__.py` - экспорт DevicePurchaseDaoImpl
- `src/infrastructure/database/models/__init__.py` - экспорт DevicePurchase
- `src/infrastructure/di/providers/dao.py` - регистрация DevicePurchaseDao

## 🎯 Ключевые преимущества

1. **Сохранение при обновлении** - докупленные устройства не теряются при продлении подписки
2. **Гибкие цены** - отдельная цена для каждой валюты
3. **История покупок** - полный аудит всех транзакций
4. **Интеграция с Remnawave** - автоматическая синхронизация лимитов
5. **Чистая архитектура** - следует существующим паттернам проекта
6. **Type-safe** - полная поддержка типов для mypy

## 🚀 Следующие шаги

1. Применить миграции: `alembic upgrade head`
2. Протестировать базовую функциональность через Python API
3. Реализовать UI в телеграм-боте
4. Интегрировать с платежными шлюзами
5. Добавить метрики и аналитику
