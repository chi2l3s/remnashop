from dataclasses import dataclass
from decimal import Decimal

from loguru import logger

from src.application.common import Interactor, Remnawave
from src.application.common.dao import DevicePurchaseDao, SubscriptionDao, UserDao
from src.application.common.uow import UnitOfWork
from src.application.dto import DevicePurchaseDto, SubscriptionDto, UserDto
from src.core.enums import Currency
from src.core.exceptions import SubscriptionNotFoundError


@dataclass(frozen=True)
class PurchaseDevicesDto:
    user: UserDto
    subscription: SubscriptionDto | None
    devices_count: int
    price_per_device: Decimal
    currency: Currency
    payment_id: str | None = None


class PurchaseDevices(Interactor[PurchaseDevicesDto, DevicePurchaseDto]):
    """Use case для покупки дополнительных устройств."""

    required_permission = None

    def __init__(
        self,
        uow: UnitOfWork,
        subscription_dao: SubscriptionDao,
        device_purchase_dao: DevicePurchaseDao,
        user_dao: UserDao,
        remnawave: Remnawave,
    ) -> None:
        self.uow = uow
        self.subscription_dao = subscription_dao
        self.device_purchase_dao = device_purchase_dao
        self.user_dao = user_dao
        self.remnawave = remnawave

    async def _execute(self, actor: UserDto, data: PurchaseDevicesDto) -> DevicePurchaseDto:
        user = data.user
        subscription = data.subscription
        devices_count = data.devices_count
        price_per_device = data.price_per_device

        if not subscription:
            raise SubscriptionNotFoundError(f"Subscription not found for user '{user.id}'")

        if devices_count <= 0:
            raise ValueError(f"Invalid devices count '{devices_count}' for user '{user.id}'")

        logger.info(
            f"{actor.log} Purchasing {devices_count} devices for user '{user.id}' "
            f"at {price_per_device} {data.currency} per device"
        )

        # Обновляем количество extra_devices
        subscription.extra_devices += devices_count

        # Обновляем подписку в Remnawave (используется total_device_limit)
        await self.remnawave.update_user(
            user=user,
            uuid=subscription.user_remna_id,
            subscription=subscription,
            reset_traffic=False,
        )

        # Сохраняем изменения в базе
        async with self.uow:
            await self.subscription_dao.update(subscription)

            if user.purchase_discount:
                user.purchase_discount = 0
                await self.user_dao.update(user)

            # Создаем запись о покупке
            purchase = DevicePurchaseDto(
                user_id=user.id,
                subscription_id=subscription.id,
                devices_added=devices_count,
                price_per_device=price_per_device,
                total_price=price_per_device * devices_count,
                currency=data.currency,
                payment_id=data.payment_id,
            )
            purchase = await self.device_purchase_dao.create(purchase)
            await self.uow.commit()

        logger.info(
            f"{actor.log} Successfully purchased {devices_count} devices for user '{user.id}'. "
            f"Total devices now: {subscription.total_device_limit}"
        )
        return purchase
