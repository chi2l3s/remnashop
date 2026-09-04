# Функция докупки дополнительных устройств

## Описание

Данная функциональность позволяет пользователям докупать дополнительные устройства к своей подписке за отдельную плату. При обновлении или продлении подписки количество докупленных устройств сохраняется.

## Что было добавлено

### 1. Модели данных

#### Таблица `device_purchases`
История покупок дополнительных устройств:
- `id` - ID записи
- `user_id` - ID пользователя
- `subscription_id` - ID подписки
- `devices_added` - Количество добавленных устройств
- `price_per_device` - Цена за одно устройство
- `total_price` - Общая стоимость
- `currency` - Валюта
- `payment_id` - ID платежа (опционально)
- `created_at`, `updated_at` - Временные метки

#### Поле `extra_devices` в таблице `subscriptions`
Хранит количество докупленных устройств для подписки (по умолчанию 0).

### 2. DTO и DAO

- `DevicePurchaseDto` - DTO для покупки устройств
- `DevicePurchaseDao` - Protocol для работы с покупками
- `DevicePurchaseDaoImpl` - Реализация DAO

### 3. Use Case

`PurchaseDevices` (`src/application/use_cases/subscription/commands/purchase_devices.py`)
- Добавляет устройства к подписке
- Обновляет информацию в Remnawave
- Сохраняет историю покупки

### 4. Обновлена логика продления подписки

В `PurchaseSubscription` при обновлении подписки:
- Базовое количество устройств обновляется из нового плана
- **Количество extra_devices сохраняется без изменений**
- В Remnawave отправляется `total_device_limit` (базовое + докупленное)

### 5. Настройки

Добавлен `DevicePurchaseSettingsDto` в настройки системы:
```python
{
    "enabled": true,  # Включить/выключить функцию
    "prices": {
        "USD": 5,
        "RUB": 500,
        "XTR": 50
    }
}
```

### 6. Свойства SubscriptionDto

- `total_device_limit` - общее количество устройств (device_limit + extra_devices)
- Это свойство используется при создании/обновлении пользователя в Remnawave

## Использование

### Настройка цен

Цены за одно устройство настраиваются в админ-панели или через API в разделе Settings:

```python
settings.extra.device_purchase.prices = {
    Currency.USD: 10,  # $10 за устройство
    Currency.RUB: 1000,  # 1000₽ за устройство
    Currency.XTR: 100,  # 100★ за устройство
}
```

### Покупка устройств

Для покупки устройств используйте use case `PurchaseDevices`:

```python
from src.application.use_cases.subscription.commands.purchase_devices import (
    PurchaseDevices,
    PurchaseDevicesDto,
)

# Создать DTO для покупки
purchase_data = PurchaseDevicesDto(
    user=user,
    subscription=subscription,
    devices_count=3,  # Докупить 3 устройства
    price_per_device=Decimal("500"),
    currency=Currency.RUB,
    payment_id="payment_123",  # ID платежа (опционально)
)

# Выполнить покупку
purchase = await purchase_devices_use_case(actor=user, data=purchase_data)
```

### Получение истории покупок

```python
# Получить все покупки для подписки
purchases = await device_purchase_dao.get_by_subscription(subscription_id)

for purchase in purchases:
    print(f"Добавлено {purchase.devices_added} устройств")
    print(f"Цена: {purchase.total_price} {purchase.currency}")
```

## Интеграция с платежной системой

Для интеграции с платежной системой:

1. Создайте обработчик платежа для покупки устройств
2. После успешного платежа вызовите `PurchaseDevices`
3. Передайте `payment_id` для связи с транзакцией

Пример структуры:

```python
async def handle_device_purchase_payment(payment_data):
    # 1. Проверить платеж
    if not payment_data.is_successful:
        return
    
    # 2. Получить данные пользователя и подписки
    user = await user_dao.get_by_id(payment_data.user_id)
    subscription = await subscription_dao.get_current(user.id)
    
    # 3. Получить настройки цен
    settings = await settings_dao.get()
    price_per_device = settings.extra.device_purchase.get_price(payment_data.currency)
    
    # 4. Выполнить покупку
    purchase_data = PurchaseDevicesDto(
        user=user,
        subscription=subscription,
        devices_count=payment_data.devices_count,
        price_per_device=Decimal(price_per_device),
        currency=payment_data.currency,
        payment_id=payment_data.payment_id,
    )
    
    await purchase_devices(actor=user, data=purchase_data)
```

## Миграции

Для применения изменений выполните миграции:

```bash
# Применить миграции
alembic upgrade head

# Или через make (если есть)
make migrate
```

Созданы следующие миграции:
- `0041_add_device_purchases.py` - создание таблицы device_purchases и поля extra_devices
- `0042_add_device_purchase_settings.py` - инициализация настроек

## Telegram Bot UI (TODO)

Для полной интеграции нужно добавить UI в телеграм-боте:

1. Кнопку "Докупить устройства" в меню подписки
2. Диалог выбора количества устройств
3. Выбор способа оплаты
4. Обработку платежа
5. Уведомление об успешной покупке

Примерный flow:
```
[Моя подписка] 
  → Устройства: 3 из 5 (базовых)
  → [Докупить устройства]
    → Выберите количество: [1] [3] [5] [10]
    → Цена: 500₽ за устройство
    → Итого: 1500₽
    → [Оплатить]
      → Выбор шлюза
      → Обработка платежа
      → ✅ Устройства добавлены!
```

## Особенности

1. **Сохранение при обновлении** - при продлении или изменении подписки докупленные устройства сохраняются
2. **Независимость от плана** - extra_devices не зависят от базового device_limit плана
3. **История покупок** - все покупки сохраняются в БД для аудита
4. **Гибкие цены** - цены настраиваются для каждой валюты отдельно
5. **Интеграция с Remnawave** - при обновлении в панель отправляется суммарное количество устройств

## Пример работы

```
Исходная подписка:
- device_limit (базовый): 2
- extra_devices (докупленные): 0
- total_device_limit: 2

Пользователь докупает 3 устройства:
- device_limit: 2
- extra_devices: 3
- total_device_limit: 5

Пользователь продлевает подписку на новый план (device_limit = 5):
- device_limit: 5  (обновлено из плана)
- extra_devices: 3  (СОХРАНЕНО)
- total_device_limit: 8

Итого: у пользователя теперь 8 устройств вместо 5!
```

## Безопасность

- Все покупки привязаны к пользователю и подписке через foreign keys с CASCADE
- При удалении подписки все связанные покупки также удаляются
- Цены валидируются на уровне настроек
- История покупок сохраняется для аудита
