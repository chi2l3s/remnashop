"""
Пример интеграции покупки устройств с платежными шлюзами.

Этот файл показывает как можно интегрировать функцию покупки устройств
с существующей системой платежей в проекте.
"""

from dataclasses import dataclass
from decimal import Decimal

from src.application.common import Interactor
from src.application.common.dao import DevicePurchaseDao, SettingsDao, SubscriptionDao, UserDao
from src.application.common.uow import UnitOfWork
from src.application.dto import UserDto
from src.application.use_cases.subscription.commands.purchase_devices import (
    PurchaseDevices,
    PurchaseDevicesDto,
)
from src.core.enums import Currency, PaymentGatewayType
from src.core.exceptions import SubscriptionNotFoundError


@dataclass(frozen=True)
class InitiateDevicePurchaseDto:
    """DTO для инициации покупки устройств."""

    user_id: int
    devices_count: int
    gateway_type: PaymentGatewayType
    currency: Currency


class InitiateDevicePurchase(Interactor[InitiateDevicePurchaseDto, str]):
    """
    Use case для создания платежа за устройства.

    Возвращает payment_url для перенаправления пользователя на оплату.
    """

    required_permission = None

    def __init__(
        self,
        user_dao: UserDao,
        subscription_dao: SubscriptionDao,
        settings_dao: SettingsDao,
        # payment_gateway_service: PaymentGatewayService,  # Ваш сервис для работы с платежами
    ) -> None:
        self.user_dao = user_dao
        self.subscription_dao = subscription_dao
        self.settings_dao = settings_dao
        # self.payment_gateway_service = payment_gateway_service

    async def _execute(self, actor: UserDto, data: InitiateDevicePurchaseDto) -> str:
        # 1. Получить данные пользователя
        user = await self.user_dao.get_by_id(data.user_id)
        if not user:
            raise ValueError(f"User {data.user_id} not found")

        # 2. Получить текущую подписку
        subscription = await self.subscription_dao.get_current(user.id)
        if not subscription:
            raise SubscriptionNotFoundError(f"No active subscription for user {user.id}")

        # 3. Получить цену из настроек
        settings = await self.settings_dao.get()

        if not settings.extra.device_purchase.enabled:
            raise ValueError("Device purchase is disabled")

        price_per_device = settings.extra.device_purchase.get_price(data.currency)
        if price_per_device == 0:
            raise ValueError(f"No price configured for currency {data.currency}")

        total_amount = Decimal(price_per_device) * data.devices_count

        # 4. Создать платеж через шлюз
        # payment = await self.payment_gateway_service.create_payment(
        #     gateway_type=data.gateway_type,
        #     amount=total_amount,
        #     currency=data.currency,
        #     description=f"Purchase {data.devices_count} devices",
        #     metadata={
        #         "user_id": user.id,
        #         "subscription_id": subscription.id,
        #         "devices_count": data.devices_count,
        #         "price_per_device": str(price_per_device),
        #         "type": "device_purchase",  # Важно для обработки webhook
        #     }
        # )

        # return payment.payment_url

        # Временная заглушка для примера
        return f"https://payment.example.com/pay?amount={total_amount}"


@dataclass(frozen=True)
class ProcessDevicePurchasePaymentDto:
    """DTO для обработки успешного платежа."""

    payment_id: str
    user_id: int
    subscription_id: int
    devices_count: int
    price_per_device: Decimal
    currency: Currency


class ProcessDevicePurchasePayment(Interactor[ProcessDevicePurchasePaymentDto, None]):
    """
    Use case для обработки успешного платежа за устройства.

    Вызывается из webhook обработчика платежного шлюза.
    """

    required_permission = None

    def __init__(
        self,
        uow: UnitOfWork,
        user_dao: UserDao,
        subscription_dao: SubscriptionDao,
        purchase_devices: PurchaseDevices,
    ) -> None:
        self.uow = uow
        self.user_dao = user_dao
        self.subscription_dao = subscription_dao
        self.purchase_devices = purchase_devices

    async def _execute(self, actor: UserDto, data: ProcessDevicePurchasePaymentDto) -> None:
        # 1. Получить данные
        user = await self.user_dao.get_by_id(data.user_id)
        subscription = await self.subscription_dao.get_by_id(data.subscription_id)

        if not user or not subscription:
            raise ValueError(f"User or subscription not found")

        # 2. Выполнить покупку устройств
        purchase_data = PurchaseDevicesDto(
            user=user,
            subscription=subscription,
            devices_count=data.devices_count,
            price_per_device=data.price_per_device,
            currency=data.currency,
            payment_id=data.payment_id,
        )

        await self.purchase_devices(actor=actor, data=purchase_data)

        # 3. Отправить уведомление пользователю (опционально)
        # await self.notification_service.send_device_purchase_success(
        #     user=user,
        #     devices_count=data.devices_count,
        #     total_devices=subscription.total_device_limit,
        # )


# ============================================================================
# Пример использования в телеграм-боте
# ============================================================================


async def handle_device_purchase_button(callback_query, user: UserDto, container):
    """
    Обработчик нажатия кнопки "Докупить устройства" в телеграм-боте.
    """
    from aiogram import types
    from aiogram.utils.keyboard import InlineKeyboardBuilder

    # Получить текущую подписку
    subscription_dao = await container.get(SubscriptionDao)
    subscription = await subscription_dao.get_current(user.id)

    if not subscription:
        await callback_query.message.answer("❌ У вас нет активной подписки")
        return

    # Получить настройки
    settings_dao = await container.get(SettingsDao)
    settings = await settings_dao.get()

    if not settings.extra.device_purchase.enabled:
        await callback_query.message.answer("❌ Покупка устройств временно недоступна")
        return

    # Показать варианты количества
    builder = InlineKeyboardBuilder()

    for count in [1, 3, 5, 10]:
        price = settings.extra.device_purchase.get_price(settings.default_currency)
        total = price * count
        symbol = settings.default_currency.symbol

        builder.button(
            text=f"{count} шт. — {total}{symbol}",
            callback_data=f"buy_devices:{count}",
        )

    builder.adjust(2)

    current_devices = subscription.total_device_limit
    await callback_query.message.answer(
        f"📱 Текущее количество устройств: {current_devices}\n\n"
        f"Выберите сколько устройств хотите докупить:",
        reply_markup=builder.as_markup(),
    )


async def handle_device_purchase_confirm(callback_query, user: UserDto, devices_count: int, container):
    """
    Обработчик подтверждения покупки и выбора способа оплаты.
    """
    from aiogram.utils.keyboard import InlineKeyboardBuilder

    # Получить настройки
    settings_dao = await container.get(SettingsDao)
    settings = await settings_dao.get()

    # Создать платеж
    initiate_purchase = await container.get(InitiateDevicePurchase)

    # Показать доступные способы оплаты
    builder = InlineKeyboardBuilder()

    # Пример: показать только активные шлюзы
    # payment_gateways = await payment_gateway_dao.get_active()

    # Для примера используем заглушки
    builder.button(
        text="💳 YooKassa",
        callback_data=f"pay_devices:{devices_count}:yookassa",
    )
    builder.button(
        text="⭐️ Telegram Stars",
        callback_data=f"pay_devices:{devices_count}:stars",
    )
    builder.button(
        text="🔙 Назад",
        callback_data="back_to_subscription",
    )

    builder.adjust(1)

    price = settings.extra.device_purchase.get_price(settings.default_currency)
    total = price * devices_count
    symbol = settings.default_currency.symbol

    await callback_query.message.edit_text(
        f"📱 Покупка {devices_count} устройств\n\n"
        f"💰 Стоимость: {total}{symbol}\n"
        f"   ({price}{symbol} за устройство)\n\n"
        f"Выберите способ оплаты:",
        reply_markup=builder.as_markup(),
    )


async def handle_device_payment_create(
    callback_query,
    user: UserDto,
    devices_count: int,
    gateway_type: str,
    container,
):
    """
    Создание платежа и перенаправление пользователя.
    """
    # Получить настройки
    settings_dao = await container.get(SettingsDao)
    settings = await settings_dao.get()

    # Создать платеж
    initiate_purchase = await container.get(InitiateDevicePurchase)

    purchase_dto = InitiateDevicePurchaseDto(
        user_id=user.id,
        devices_count=devices_count,
        gateway_type=PaymentGatewayType(gateway_type.upper()),
        currency=settings.default_currency,
    )

    payment_url = await initiate_purchase(actor=user, data=purchase_dto)

    # Отправить ссылку на оплату
    from aiogram.utils.keyboard import InlineKeyboardBuilder

    builder = InlineKeyboardBuilder()
    builder.button(text="💳 Оплатить", url=payment_url)

    await callback_query.message.answer(
        f"✅ Счет на {devices_count} устройств создан!\n\n"
        f"Нажмите кнопку ниже для оплаты:",
        reply_markup=builder.as_markup(),
    )


# ============================================================================
# Пример webhook обработчика для платежного шлюза
# ============================================================================


async def webhook_device_purchase_handler(webhook_data: dict, container):
    """
    Обработчик webhook от платежного шлюза.

    Вызывается когда платеж был успешно завершен.
    """
    # Парсинг данных от платежного шлюза
    payment_id = webhook_data.get("payment_id")
    status = webhook_data.get("status")
    metadata = webhook_data.get("metadata", {})

    # Проверить что это платеж за устройства
    if metadata.get("type") != "device_purchase":
        return  # Это другой тип платежа

    # Проверить статус
    if status != "succeeded":
        return  # Платеж не завершен

    # Получить данные из metadata
    user_id = metadata["user_id"]
    subscription_id = metadata["subscription_id"]
    devices_count = metadata["devices_count"]
    price_per_device = Decimal(metadata["price_per_device"])
    currency = Currency(metadata.get("currency", "RUB"))

    # Создать системного пользователя для выполнения операции
    from src.application.dto import TempUserDto
    from src.core.enums import Role

    system_user = TempUserDto(
        telegram_id=0,
        name="SYSTEM",
        role=Role.SYSTEM,
    )

    # Обработать платеж
    process_payment = await container.get(ProcessDevicePurchasePayment)

    payment_dto = ProcessDevicePurchasePaymentDto(
        payment_id=payment_id,
        user_id=user_id,
        subscription_id=subscription_id,
        devices_count=devices_count,
        price_per_device=price_per_device,
        currency=currency,
    )

    try:
        await process_payment(actor=system_user, data=payment_dto)

        # Отправить уведомление пользователю в телеграм
        # await bot.send_message(
        #     chat_id=user.telegram_id,
        #     text=f"✅ Устройства успешно добавлены!\n\n"
        #          f"📱 Куплено устройств: {devices_count}\n"
        #          f"💰 Оплачено: {price_per_device * devices_count} {currency.symbol}"
        # )

    except Exception as e:
        # Логировать ошибку
        # logger.error(f"Failed to process device purchase payment {payment_id}: {e}")

        # Отправить уведомление в админ-чат
        # await notify_admins(f"⚠️ Ошибка обработки платежа {payment_id}")
        pass
