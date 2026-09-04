from typing import Optional, cast

from adaptix import Retort
from adaptix.conversion import ConversionRetort
from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.common.dao import DevicePurchaseDao
from src.application.dto.device_purchase import DevicePurchaseDto
from src.infrastructure.database.models.device_purchase import DevicePurchase

from .base import BaseDaoImpl


class DevicePurchaseDaoImpl(DevicePurchaseDao, BaseDaoImpl):
    def __init__(
        self,
        session: AsyncSession,
        retort: Retort,
        conversion_retort: ConversionRetort,
    ) -> None:
        self.session = session
        self.retort = retort
        self.conversion_retort = conversion_retort

        self._convert_to_dto = self.conversion_retort.get_converter(
            DevicePurchase, DevicePurchaseDto
        )
        self._convert_to_dto_list = self.conversion_retort.get_converter(
            list[DevicePurchase], list[DevicePurchaseDto]
        )

    async def create(self, purchase: DevicePurchaseDto) -> DevicePurchaseDto:
        purchase_data = self.retort.dump(purchase)
        purchase_data.pop("id", None)
        db_purchase = DevicePurchase(**purchase_data)

        self.session.add(db_purchase)
        await self.session.flush()

        logger.debug(
            f"Created device purchase '{db_purchase.id}' "
            f"for subscription '{purchase.subscription_id}'"
        )
        return self._convert_to_dto(db_purchase)

    async def get_by_subscription(self, subscription_id: int) -> list[DevicePurchaseDto]:
        stmt = (
            select(DevicePurchase)
            .where(DevicePurchase.subscription_id == subscription_id)
            .order_by(DevicePurchase.created_at.desc())
        )
        result = await self.session.scalars(stmt)
        db_purchases = cast(list, result.all())

        logger.debug(
            f"Retrieved '{len(db_purchases)}' device purchases "
            f"for subscription_id='{subscription_id}'"
        )
        return self._convert_to_dto_list(db_purchases)

    async def get_by_id(self, purchase_id: int) -> Optional[DevicePurchaseDto]:
        stmt = select(DevicePurchase).where(DevicePurchase.id == purchase_id)
        db_purchase = await self.session.scalar(stmt)

        if db_purchase:
            logger.debug(f"Device purchase '{purchase_id}' found")
            return self._convert_to_dto(db_purchase)

        logger.debug(f"Device purchase '{purchase_id}' not found")
        return None
