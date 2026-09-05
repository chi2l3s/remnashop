from decimal import Decimal
from typing import Any, Optional, cast

from adaptix import Retort
from aiogram.types import CallbackQuery
from aiogram_dialog import DialogManager
from aiogram_dialog.widgets.kbd import Button, Select
from dishka import FromDishka
from dishka.integrations.aiogram_dialog import inject
from loguru import logger

from src.application.common import Notifier, TranslatorRunner
from src.application.common.dao import (
    PaymentGatewayDao,
    SettingsDao,
    SubscriptionDao,
)
from src.application.dto import (
    PriceDetailsDto,
    SubscriptionDto,
    TelegramUserDto,
)
from src.application.dto.settings import DevicePurchaseSettingsDto
from src.application.services import PricingService
from src.application.use_cases.gateways.commands.payment import (
    CreatePayment,
    CreatePaymentDto,
    ProcessPayment,
    ProcessPaymentDto,
)
from src.core.config import AppConfig
from src.core.constants import USER_KEY
from src.core.enums import Currency, PaymentGatewayType, PurchaseType, TransactionStatus
from src.telegram.states import Subscription
from src.telegram.utils import is_double_click

from .getters import _get_gateway_title
from .handlers import CachedPaymentData, _save_payment_data

DEVICES_COUNT_KEY = "devices_count"
DEVICES_PAYMENT_CACHE_KEY = "devices_payment_cache"
DEVICES_METHOD_KEY = "selected_devices_method"
ONLY_SINGLE_METHOD_KEY = "only_single_devices_method"
DEVICES_QUANTITIES = (1, 2, 3, 5, 10)


def _load_devices_payment_cache(dialog_manager: DialogManager) -> dict[str, CachedPaymentData]:
    if DEVICES_PAYMENT_CACHE_KEY not in dialog_manager.dialog_data:
        dialog_manager.dialog_data[DEVICES_PAYMENT_CACHE_KEY] = {}
    return cast(dict[str, CachedPaymentData], dialog_manager.dialog_data[DEVICES_PAYMENT_CACHE_KEY])


def _format_quantity_label(
    i18n: TranslatorRunner,
    user: TelegramUserDto,
    count: int,
    device_purchase: DevicePurchaseSettingsDto,
    currency: Currency,
    pricing_service: PricingService,
) -> str:
    raw_price = Decimal(device_purchase.get_price(currency))
    if raw_price <= 0:
        return i18n.get("btn-subscription.devices-count", count=count)

    price = pricing_service.calculate(user, raw_price * count, currency)
    if price.is_free:
        return i18n.get("btn-subscription.devices-count", count=count)

    return i18n.get(
        "btn-subscription.devices-count-priced",
        count=count,
        final_amount=price.final_amount,
        currency=currency.symbol,
    )


@inject
async def devices_count_getter(
    dialog_manager: DialogManager,
    user: TelegramUserDto,
    i18n: FromDishka[TranslatorRunner],
    settings_dao: FromDishka[SettingsDao],
    subscription_dao: FromDishka[SubscriptionDao],
    pricing_service: FromDishka[PricingService],
    **kwargs: Any,
) -> dict[str, Any]:
    settings = await settings_dao.get()
    subscription = await subscription_dao.get_current(user.id)
    device_purchase = settings.extra.device_purchase
    currency = settings.default_currency

    price = pricing_service.calculate(user, Decimal(device_purchase.get_price(currency)), currency)

    return {
        "base_devices": subscription.device_limit if subscription else 0,
        "extra_devices": subscription.extra_devices if subscription else 0,
        "price": price.final_amount,
        "currency": currency.symbol,
        "has_price": not price.is_free,
        "quantities": [
            {
                "count": count,
                "label": _format_quantity_label(
                    i18n, user, count, device_purchase, currency, pricing_service
                ),
            }
            for count in DEVICES_QUANTITIES
        ],
    }


@inject
async def devices_method_getter(
    dialog_manager: DialogManager,
    user: TelegramUserDto,
    i18n: FromDishka[TranslatorRunner],
    settings_dao: FromDishka[SettingsDao],
    payment_gateway_dao: FromDishka[PaymentGatewayDao],
    pricing_service: FromDishka[PricingService],
    **kwargs: Any,
) -> dict[str, Any]:
    devices_count: int = dialog_manager.dialog_data[DEVICES_COUNT_KEY]
    settings = await settings_dao.get()
    device_purchase = settings.extra.device_purchase

    payment_methods = []
    for gateway in await payment_gateway_dao.get_active():
        raw_price = Decimal(device_purchase.get_price(gateway.currency)) * devices_count
        if raw_price <= 0:
            continue

        price = pricing_service.calculate(user, raw_price, gateway.currency)
        payment_methods.append(
            {
                "gateway_type": gateway.type,
                "gateway_title": _get_gateway_title(i18n, gateway),
                "final_amount": price.final_amount,
                "original_amount": price.original_amount,
                "discount_percent": price.discount_percent,
                "currency": gateway.currency.symbol,
            }
        )

    return {
        "devices_count": devices_count,
        "payment_methods": payment_methods,
        "only_single_method": dialog_manager.dialog_data.get(ONLY_SINGLE_METHOD_KEY, False),
    }


@inject
async def devices_confirm_getter(
    dialog_manager: DialogManager,
    user: TelegramUserDto,
    i18n: FromDishka[TranslatorRunner],
    retort: FromDishka[Retort],
    payment_gateway_dao: FromDishka[PaymentGatewayDao],
    **kwargs: Any,
) -> dict[str, Any]:
    devices_count: int = dialog_manager.dialog_data[DEVICES_COUNT_KEY]
    pricing = retort.load(dialog_manager.dialog_data["final_pricing"], PriceDetailsDto)
    gateway_type: PaymentGatewayType = dialog_manager.dialog_data[DEVICES_METHOD_KEY]
    payment_gateway = await payment_gateway_dao.get_by_type(gateway_type)

    if not payment_gateway:
        raise ValueError(f"Not found PaymentGateway by selected type '{gateway_type}'")

    return {
        "devices_count": devices_count,
        "final_amount": pricing.final_amount,
        "original_amount": pricing.original_amount,
        "discount_percent": pricing.discount_percent,
        "currency": payment_gateway.currency.symbol,
        "payment_method_title": _get_gateway_title(i18n, payment_gateway),
        "url": dialog_manager.dialog_data["payment_url"],
        "is_free": pricing.is_free,
        "only_single_method": dialog_manager.dialog_data.get(ONLY_SINGLE_METHOD_KEY, False),
    }


@inject
async def devices_success_getter(
    dialog_manager: DialogManager,
    config: FromDishka[AppConfig],
    user: TelegramUserDto,
    subscription_dao: FromDishka[SubscriptionDao],
    settings_dao: FromDishka[SettingsDao],
    **kwargs: Any,
) -> dict[str, Any]:
    subscription = await subscription_dao.get_current(user.id)

    if not subscription:
        raise ValueError(f"User '{user.telegram_id}' has no active subscription after purchase")

    settings = await settings_dao.get()

    return {
        "devices_count": subscription.extra_devices,
        "total_devices": subscription.total_device_limit,
        "is_mini_app": config.bot.is_mini_app,
        "is_mini_app_reserve": config.bot.is_mini_app and settings.extra.mini_app_reserve,
        "connection_url": config.bot.mini_app_url or subscription.url,
        "subscription_url": subscription.url,
        "connectable": True,
    }


async def _create_devices_payment_and_get_data(
    dialog_manager: DialogManager,
    user: TelegramUserDto,
    subscription: SubscriptionDto,
    devices_count: int,
    gateway_type: PaymentGatewayType,
    retort: Retort,
    settings: Any,
    payment_gateway_dao: PaymentGatewayDao,
    notifier: Notifier,
    pricing_service: PricingService,
    create_payment: CreatePayment,
) -> Optional[CachedPaymentData]:
    payment_gateway = await payment_gateway_dao.get_by_type(gateway_type)

    if not payment_gateway:
        logger.error(f"{user.log} Failed to find gateway '{gateway_type}' for devices payment")
        return None

    device_purchase = settings.extra.device_purchase
    raw_total = Decimal(device_purchase.get_price(payment_gateway.currency)) * devices_count
    pricing = pricing_service.calculate(user, raw_total, payment_gateway.currency)

    try:
        result = await create_payment(
            user,
            CreatePaymentDto(
                plan_snapshot=subscription.plan_snapshot,
                pricing=pricing,
                purchase_type=PurchaseType.DEVICES,
                gateway_type=gateway_type,
                devices_count=devices_count,
            ),
        )
    except Exception:
        logger.exception(f"{user.log} Failed to create devices payment")
        await notifier.notify_user(user, i18n_key="ntf-subscription.payment-creation-failed")
        return None

    return CachedPaymentData(
        payment_id=str(result.id),
        payment_url=result.url,
        final_pricing=retort.dump(pricing),
    )


@inject
async def on_devices_count_select(
    callback: CallbackQuery,
    widget: Select,
    dialog_manager: DialogManager,
    selected_count: int,
    retort: FromDishka[Retort],
    settings_dao: FromDishka[SettingsDao],
    subscription_dao: FromDishka[SubscriptionDao],
    payment_gateway_dao: FromDishka[PaymentGatewayDao],
    pricing_service: FromDishka[PricingService],
    notifier: FromDishka[Notifier],
    create_payment: FromDishka[CreatePayment],
) -> None:
    user: TelegramUserDto = dialog_manager.middleware_data[USER_KEY]
    logger.info(f"{user.log} Selected devices count '{selected_count}'")
    dialog_manager.dialog_data[DEVICES_COUNT_KEY] = selected_count
    dialog_manager.dialog_data.pop(DEVICES_PAYMENT_CACHE_KEY, None)

    subscription = await subscription_dao.get_current(user.id)
    if not subscription or subscription.is_trial:
        logger.warning(f"{user.log} Devices purchase unavailable: no active subscription")
        await notifier.notify_user(user, i18n_key="ntf-subscription.devices-unavailable")
        return

    settings = await settings_dao.get()
    device_purchase = settings.extra.device_purchase

    if not device_purchase.enabled:
        logger.warning(f"{user.log} Devices purchase unavailable: feature disabled")
        await notifier.notify_user(user, i18n_key="ntf-subscription.devices-unavailable")
        return

    gateways = [
        gateway
        for gateway in await payment_gateway_dao.get_active()
        if device_purchase.get_price(gateway.currency) > 0
    ]

    if not gateways:
        logger.warning(f"{user.log} Devices purchase unavailable: no gateways with price")
        await notifier.notify_user(user, i18n_key="ntf-subscription.devices-unavailable")
        return

    if len(gateways) == 1:
        logger.info(f"{user.log} Auto-selected single gateway '{gateways[0].type}'")
        dialog_manager.dialog_data[DEVICES_METHOD_KEY] = gateways[0].type
        dialog_manager.dialog_data[ONLY_SINGLE_METHOD_KEY] = True

        payment_data = await _create_devices_payment_and_get_data(
            dialog_manager=dialog_manager,
            user=user,
            subscription=subscription,
            devices_count=selected_count,
            gateway_type=gateways[0].type,
            retort=retort,
            settings=settings,
            payment_gateway_dao=payment_gateway_dao,
            notifier=notifier,
            pricing_service=pricing_service,
            create_payment=create_payment,
        )

        if payment_data:
            _save_payment_data(dialog_manager, payment_data)
            await dialog_manager.switch_to(state=Subscription.DEVICES_CONFIRM)
        return

    dialog_manager.dialog_data[ONLY_SINGLE_METHOD_KEY] = False
    await dialog_manager.switch_to(state=Subscription.DEVICES_METHOD)


@inject
async def on_devices_method_select(
    callback: CallbackQuery,
    widget: Select,
    dialog_manager: DialogManager,
    selected_payment_method: PaymentGatewayType,
    retort: FromDishka[Retort],
    settings_dao: FromDishka[SettingsDao],
    subscription_dao: FromDishka[SubscriptionDao],
    payment_gateway_dao: FromDishka[PaymentGatewayDao],
    pricing_service: FromDishka[PricingService],
    notifier: FromDishka[Notifier],
    create_payment: FromDishka[CreatePayment],
) -> None:
    user: TelegramUserDto = dialog_manager.middleware_data[USER_KEY]
    devices_count: int = dialog_manager.dialog_data[DEVICES_COUNT_KEY]
    logger.info(f"{user.log} Selected devices payment method '{selected_payment_method}'")
    dialog_manager.dialog_data[DEVICES_METHOD_KEY] = selected_payment_method

    cache = _load_devices_payment_cache(dialog_manager)
    cache_key = f"{devices_count}:{selected_payment_method.value}"

    if cache_key in cache:
        logger.info(f"{user.log} Re-selected same devices payment method")
        _save_payment_data(dialog_manager, cache[cache_key])
        await dialog_manager.switch_to(state=Subscription.DEVICES_CONFIRM)
        return

    subscription = await subscription_dao.get_current(user.id)
    if not subscription or subscription.is_trial:
        logger.warning(f"{user.log} Devices purchase unavailable: no active subscription")
        await notifier.notify_user(user, i18n_key="ntf-subscription.devices-unavailable")
        return

    settings = await settings_dao.get()
    payment_data = await _create_devices_payment_and_get_data(
        dialog_manager=dialog_manager,
        user=user,
        subscription=subscription,
        devices_count=devices_count,
        gateway_type=selected_payment_method,
        retort=retort,
        settings=settings,
        payment_gateway_dao=payment_gateway_dao,
        notifier=notifier,
        pricing_service=pricing_service,
        create_payment=create_payment,
    )

    if payment_data:
        cache[cache_key] = payment_data
        _save_payment_data(dialog_manager, payment_data)

    await dialog_manager.switch_to(state=Subscription.DEVICES_CONFIRM)


@inject
async def on_get_devices(
    callback: CallbackQuery,
    widget: Button,
    dialog_manager: DialogManager,
    process_payment: FromDishka[ProcessPayment],
) -> None:
    if is_double_click(dialog_manager, key="devices_get"):
        return

    user: TelegramUserDto = dialog_manager.middleware_data[USER_KEY]
    payment_id = dialog_manager.dialog_data["payment_id"]
    gateway_type: PaymentGatewayType = dialog_manager.dialog_data[DEVICES_METHOD_KEY]
    logger.info(f"{user.log} Getting free devices '{payment_id}'")
    await process_payment.system(
        ProcessPaymentDto(
            payment_id=payment_id,
            new_transaction_status=TransactionStatus.COMPLETED,
            gateway_type=gateway_type,
        ),
    )
