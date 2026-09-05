from aiogram.enums import ButtonStyle
from aiogram_dialog import Dialog, Window
from aiogram_dialog.widgets.input import MessageInput
from aiogram_dialog.widgets.style import Style
from aiogram_dialog.widgets.text import Format
from magic_filter import F

from src.core.constants import PAYMENT_PREFIX
from src.core.enums import BannerName, PaymentGatewayType, PurchaseType
from src.telegram.keyboards import back_main_menu_button, connect_buttons
from src.telegram.states import Subscription
from src.telegram.widgets import Banner, I18nFormat, IgnoreUpdate
from src.telegram.widgets.kbd import Button, Column, Group, Row, Select, SwitchTo, Url

from .devices_handlers import (
    devices_confirm_getter,
    devices_count_getter,
    devices_method_getter,
    devices_success_getter,
    on_devices_count_select,
    on_devices_method_select,
    on_get_devices,
)
from .getters import (
    confirm_getter,
    duration_getter,
    getter_connect,
    payment_method_getter,
    plan_getter,
    plans_getter,
    subscription_getter,
    success_payment_getter,
)
from .handlers import (
    on_duration_select,
    on_get_subscription,
    on_payment_method_select,
    on_plan_select,
    on_subscription_plans,
    on_subscription_start,
)
from .promocode_handlers import getter_promocode, on_promocode_confirm, on_promocode_input

subscription = Window(
    Banner(BannerName.SUBSCRIPTION),
    I18nFormat("msg-subscription-main"),
    Row(
        Button(
            text=I18nFormat("btn-subscription.new"),
            id=f"{PAYMENT_PREFIX}{PurchaseType.NEW}",
            on_click=on_subscription_plans,
            when=~F["has_active_subscription"],
        ),
        Button(
            text=I18nFormat("btn-subscription.renew"),
            id=f"{PAYMENT_PREFIX}{PurchaseType.RENEW}",
            on_click=on_subscription_plans,
            when=F["has_active_subscription"] & F["is_not_unlimited"],
        ),
        Button(
            text=I18nFormat("btn-subscription.change"),
            id=f"{PAYMENT_PREFIX}{PurchaseType.CHANGE}",
            on_click=on_subscription_plans,
            when=F["has_active_subscription"],
        ),
    ),
    Row(
        Button(
            text=I18nFormat("btn-subscription.promocode"),
            id="goto_promocode",
            on_click=lambda c, w, m: m.switch_to(Subscription.PROMOCODE),
        ),
    ),
    Row(
        SwitchTo(
            text=I18nFormat("btn-subscription.devices"),
            id="goto_devices",
            state=Subscription.DEVICES_COUNT,
            when=F["devices_purchase_available"],
        ),
    ),
    *back_main_menu_button,
    IgnoreUpdate(),
    state=Subscription.MAIN,
    getter=subscription_getter,
)

plan = Window(
    Banner(BannerName.SUBSCRIPTION),
    I18nFormat("msg-subscription-plan"),
    Column(
        Select(
            text=I18nFormat("btn-subscription.plan"),
            id=f"{PAYMENT_PREFIX}select_plan",
            item_id_getter=lambda item: item,
            items="plan_id",
            type_factory=int,
            on_click=on_plan_select,
        ),
    ),
    *back_main_menu_button,
    IgnoreUpdate(),
    state=Subscription.PLAN,
    getter=plan_getter,
)


plans = Window(
    Banner(BannerName.SUBSCRIPTION),
    I18nFormat("msg-subscription-plans"),
    Column(
        Select(
            text=Format("{item[name]}"),
            id=f"{PAYMENT_PREFIX}select_plan",
            item_id_getter=lambda item: item["id"],
            items="plans",
            type_factory=int,
            on_click=on_plan_select,
        ),
    ),
    Row(
        SwitchTo(
            text=I18nFormat("btn-back.general"),
            id=f"{PAYMENT_PREFIX}back",
            state=Subscription.MAIN,
        ),
    ),
    *back_main_menu_button,
    IgnoreUpdate(),
    state=Subscription.PLANS,
    getter=plans_getter,
)

duration = Window(
    Banner(BannerName.SUBSCRIPTION),
    I18nFormat("msg-subscription-duration"),
    Group(
        Select(
            text=I18nFormat(
                "btn-subscription.duration",
                period=F["item"]["period"],
                final_amount=F["item"]["final_amount"],
                discount_percent=F["item"]["discount_percent"],
                original_amount=F["item"]["original_amount"],
                currency=F["item"]["currency"],
            ),
            id=f"{PAYMENT_PREFIX}select_duration",
            item_id_getter=lambda item: item["days"],
            items="durations",
            type_factory=int,
            on_click=on_duration_select,
        ),
        width=2,
    ),
    Row(
        SwitchTo(
            text=I18nFormat("btn-subscription.back-plans"),
            id=f"{PAYMENT_PREFIX}back_plans",
            state=Subscription.PLANS,
            when=~F["only_single_plan"],
        ),
    ),
    *back_main_menu_button,
    IgnoreUpdate(),
    state=Subscription.DURATION,
    getter=duration_getter,
)

payment_method = Window(
    Banner(BannerName.SUBSCRIPTION),
    I18nFormat("msg-subscription-payment-method"),
    Column(
        Select(
            text=I18nFormat(
                "btn-subscription.payment-method",
                gateway_title=F["item"]["gateway_title"],
                final_amount=F["item"]["final_amount"],
                original_amount=F["item"]["original_amount"],
                discount_percent=F["item"]["discount_percent"],
                currency=F["item"]["currency"],
            ),
            id=f"{PAYMENT_PREFIX}select_payment_method",
            item_id_getter=lambda item: item["gateway_type"],
            items="payment_methods",
            type_factory=PaymentGatewayType,
            on_click=on_payment_method_select,
        ),
    ),
    Row(
        SwitchTo(
            text=I18nFormat("btn-subscription.back-duration"),
            id=f"{PAYMENT_PREFIX}back",
            state=Subscription.DURATION,
            when=~F["only_single_duration"],
        ),
    ),
    Row(
        SwitchTo(
            text=I18nFormat("btn-subscription.back-plans"),
            id=f"{PAYMENT_PREFIX}back_plans",
            state=Subscription.PLANS,
            when=~F["only_single_plan"],
        ),
    ),
    *back_main_menu_button,
    IgnoreUpdate(),
    state=Subscription.PAYMENT_METHOD,
    getter=payment_method_getter,
)

confirm = Window(
    Banner(BannerName.SUBSCRIPTION),
    I18nFormat("msg-subscription-confirm"),
    Row(
        Url(
            text=I18nFormat("btn-subscription.pay"),
            url=Format("{url}"),
            when=F["url"],
            style=Style(ButtonStyle.SUCCESS),
        ),
        Button(
            text=I18nFormat("btn-subscription.get"),
            id=f"{PAYMENT_PREFIX}get",
            on_click=on_get_subscription,
            when=~F["url"],
            style=Style(ButtonStyle.SUCCESS),
        ),
    ),
    Row(
        SwitchTo(
            text=I18nFormat("btn-subscription.back-payment-method"),
            id=f"{PAYMENT_PREFIX}back_payment_method",
            state=Subscription.PAYMENT_METHOD,
            when=~F["only_single_gateway"] & ~F["is_free"],
        ),
        SwitchTo(
            text=I18nFormat("btn-subscription.back-duration"),
            id=f"{PAYMENT_PREFIX}back_duration",
            state=Subscription.DURATION,
            when=F["only_single_gateway"] & ~F["only_single_duration"] | F["is_free"],
        ),
    ),
    Row(
        SwitchTo(
            text=I18nFormat("btn-subscription.back-plans"),
            id=f"{PAYMENT_PREFIX}back_plans",
            state=Subscription.PLANS,
            when=~F["only_single_plan"],
        ),
    ),
    *back_main_menu_button,
    IgnoreUpdate(),
    state=Subscription.CONFIRM,
    getter=confirm_getter,
)

success_payment = Window(
    Banner(BannerName.SUBSCRIPTION),
    I18nFormat("msg-subscription-success"),
    *connect_buttons,
    *back_main_menu_button,
    IgnoreUpdate(),
    state=Subscription.SUCCESS,
    getter=success_payment_getter,
)

success_trial = Window(
    Banner(BannerName.SUBSCRIPTION),
    I18nFormat("msg-subscription-trial"),
    *connect_buttons,
    *back_main_menu_button,
    IgnoreUpdate(),
    state=Subscription.TRIAL,
    getter=getter_connect,
)

failed = Window(
    Banner(BannerName.SUBSCRIPTION),
    I18nFormat("msg-subscription-failed"),
    *back_main_menu_button,
    IgnoreUpdate(),
    state=Subscription.FAILED,
)

devices_count = Window(
    Banner(BannerName.SUBSCRIPTION),
    I18nFormat(
        "msg-subscription-devices-count",
        base_devices=F["base_devices"],
        extra_devices=F["extra_devices"],
        price=F["price"],
        currency=F["currency"],
        has_price=F["has_price"],
    ),
    Group(
        Select(
            text=Format("{item[label]}"),
            id="devices_select_count",
            item_id_getter=lambda item: item["count"],
            items="quantities",
            type_factory=int,
            on_click=on_devices_count_select,
        ),
        width=2,
    ),
    *back_main_menu_button,
    IgnoreUpdate(),
    state=Subscription.DEVICES_COUNT,
    getter=devices_count_getter,
)

devices_method = Window(
    Banner(BannerName.SUBSCRIPTION),
    I18nFormat(
        "msg-subscription-devices-method",
        devices_count=F["devices_count"],
    ),
    Column(
        Select(
            text=I18nFormat(
                "btn-subscription.payment-method",
                gateway_title=F["item"]["gateway_title"],
                final_amount=F["item"]["final_amount"],
                original_amount=F["item"]["original_amount"],
                discount_percent=F["item"]["discount_percent"],
                currency=F["item"]["currency"],
            ),
            id="devices_select_method",
            item_id_getter=lambda item: item["gateway_type"],
            items="payment_methods",
            type_factory=PaymentGatewayType,
            on_click=on_devices_method_select,
        ),
    ),
    Row(
        SwitchTo(
            text=I18nFormat("btn-subscription.devices-back-count"),
            id="devices_back_count",
            state=Subscription.DEVICES_COUNT,
            when=~F["only_single_method"],
        ),
    ),
    *back_main_menu_button,
    IgnoreUpdate(),
    state=Subscription.DEVICES_METHOD,
    getter=devices_method_getter,
)

devices_confirm = Window(
    Banner(BannerName.SUBSCRIPTION),
    I18nFormat(
        "msg-subscription-devices-confirm",
        devices_count=F["devices_count"],
        final_amount=F["final_amount"],
        original_amount=F["original_amount"],
        discount_percent=F["discount_percent"],
        currency=F["currency"],
        payment_method_title=F["payment_method_title"],
        is_free=F["is_free"],
    ),
    Row(
        Url(
            text=I18nFormat("btn-subscription.pay"),
            url=Format("{url}"),
            when=F["url"],
            style=Style(ButtonStyle.SUCCESS),
        ),
        Button(
            text=I18nFormat("btn-subscription.get"),
            id="devices_get",
            on_click=on_get_devices,
            when=~F["url"],
            style=Style(ButtonStyle.SUCCESS),
        ),
    ),
    Row(
        SwitchTo(
            text=I18nFormat("btn-subscription.devices-back-method"),
            id="devices_back_method",
            state=Subscription.DEVICES_METHOD,
            when=~F["only_single_method"] & ~F["is_free"],
        ),
        SwitchTo(
            text=I18nFormat("btn-subscription.devices-back-count"),
            id="devices_back_count",
            state=Subscription.DEVICES_COUNT,
            when=F["only_single_method"] | F["is_free"],
        ),
    ),
    *back_main_menu_button,
    IgnoreUpdate(),
    state=Subscription.DEVICES_CONFIRM,
    getter=devices_confirm_getter,
)

devices_success = Window(
    Banner(BannerName.SUBSCRIPTION),
    I18nFormat(
        "msg-subscription-devices-success",
        devices_count=F["devices_count"],
        total_devices=F["total_devices"],
    ),
    *connect_buttons,
    *back_main_menu_button,
    IgnoreUpdate(),
    state=Subscription.DEVICES_SUCCESS,
    getter=devices_success_getter,
)

promocode_window = Window(
    Banner(BannerName.PROMOCODE),
    I18nFormat("msg-promocode-input", ~F["has_promo"]),
    I18nFormat(
        "msg-promocode-confirm",
        F["has_promo"],
        promo_code=F["promo_code"],
        reward_type=F["promo_reward_type"],
        reward=F["promo_reward"],
        show_reset_warning=F["show_reset_warning"],
        will_replace_subscription=F["will_replace_subscription"],
    ),
    MessageInput(on_promocode_input),
    Row(
        Button(
            text=I18nFormat("btn-subscription.promocode-confirm"),
            id="confirm_promo",
            on_click=on_promocode_confirm,
            when=F["has_promo"],
        ),
    ),
    SwitchTo(
        text=I18nFormat("btn-back.general"),
        id="back_main",
        state=Subscription.MAIN,
    ),
    state=Subscription.PROMOCODE,
    getter=getter_promocode,
)

router = Dialog(
    subscription,
    promocode_window,
    plan,
    plans,
    duration,
    payment_method,
    confirm,
    success_payment,
    success_trial,
    failed,
    devices_count,
    devices_method,
    devices_confirm,
    devices_success,
    on_start=on_subscription_start,
)
