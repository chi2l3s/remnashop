from dataclasses import dataclass
from typing import Optional

from loguru import logger

from src.application.common import Interactor
from src.application.common.dao import SettingsDao
from src.application.common.policy import Permission
from src.application.common.uow import UnitOfWork
from src.application.dto import SettingsDto, UserDto
from src.core.enums import Currency

COOLDOWN_MIN = 0
COOLDOWN_MAX = 8760  # 1 year in hours

DEVICE_PRICE_MIN = 1
DEVICE_PRICE_MAX = 1_000_000


@dataclass(frozen=True)
class ToggleResetFeatureDto:
    feature: str  # "device_single_reset" | "device_all_reset" | "link_reset" | "referral_reset"


class ToggleResetFeature(Interactor[ToggleResetFeatureDto, Optional[SettingsDto]]):
    required_permission = Permission.SETTINGS_EXTRA

    def __init__(self, uow: UnitOfWork, settings_dao: SettingsDao) -> None:
        self.uow = uow
        self.settings_dao = settings_dao

    async def _execute(self, actor: UserDto, data: ToggleResetFeatureDto) -> Optional[SettingsDto]:
        async with self.uow:
            settings = await self.settings_dao.get()
            feature = getattr(settings.extra, data.feature)
            feature.enabled = not feature.enabled
            updated = await self.settings_dao.update(settings)
            await self.uow.commit()

        logger.info(f"{actor.log} Toggled {data.feature}.enabled: {feature.enabled}")
        return updated


class ToggleTrialChannelGuard(Interactor[None, Optional[SettingsDto]]):
    required_permission = Permission.SETTINGS_EXTRA

    def __init__(self, uow: UnitOfWork, settings_dao: SettingsDao) -> None:
        self.uow = uow
        self.settings_dao = settings_dao

    async def _execute(self, actor: UserDto, data: None) -> Optional[SettingsDto]:
        async with self.uow:
            settings = await self.settings_dao.get()
            settings.extra.trial_channel_guard = not settings.extra.trial_channel_guard
            updated = await self.settings_dao.update(settings)
            await self.uow.commit()

        logger.info(
            f"{actor.log} Toggled trial_channel_guard: {settings.extra.trial_channel_guard}"
        )
        return updated


class ToggleMiniAppReserve(Interactor[None, Optional[SettingsDto]]):
    required_permission = Permission.SETTINGS_EXTRA

    def __init__(self, uow: UnitOfWork, settings_dao: SettingsDao) -> None:
        self.uow = uow
        self.settings_dao = settings_dao

    async def _execute(self, actor: UserDto, data: None) -> Optional[SettingsDto]:
        async with self.uow:
            settings = await self.settings_dao.get()
            settings.extra.mini_app_reserve = not settings.extra.mini_app_reserve
            updated = await self.settings_dao.update(settings)
            await self.uow.commit()

        logger.info(f"{actor.log} Toggled mini_app_reserve: {settings.extra.mini_app_reserve}")
        return updated


@dataclass(frozen=True)
class UpdateResetCooldownDto:
    feature: str
    raw_value: str


class UpdateResetCooldown(Interactor[UpdateResetCooldownDto, Optional[SettingsDto]]):
    required_permission = Permission.SETTINGS_EXTRA

    def __init__(self, uow: UnitOfWork, settings_dao: SettingsDao) -> None:
        self.uow = uow
        self.settings_dao = settings_dao

    async def _execute(self, actor: UserDto, data: UpdateResetCooldownDto) -> Optional[SettingsDto]:
        hours = int(data.raw_value.strip())
        if hours < COOLDOWN_MIN or hours > COOLDOWN_MAX:
            raise ValueError(f"Cooldown must be between {COOLDOWN_MIN} and {COOLDOWN_MAX}")

        async with self.uow:
            settings = await self.settings_dao.get()
            feature = getattr(settings.extra, data.feature)
            feature.cooldown_hours = hours
            updated = await self.settings_dao.update(settings)
            await self.uow.commit()

        logger.info(f"{actor.log} Set {data.feature}.cooldown_hours: {hours}")
        return updated


class ToggleDevicePurchase(Interactor[None, Optional[SettingsDto]]):
    required_permission = Permission.SETTINGS_EXTRA

    def __init__(self, uow: UnitOfWork, settings_dao: SettingsDao) -> None:
        self.uow = uow
        self.settings_dao = settings_dao

    async def _execute(self, actor: UserDto, data: None) -> Optional[SettingsDto]:
        async with self.uow:
            settings = await self.settings_dao.get()
            settings.extra.device_purchase.enabled = not settings.extra.device_purchase.enabled
            updated = await self.settings_dao.update(settings)
            await self.uow.commit()

        logger.info(
            f"{actor.log} Toggled device_purchase.enabled: {settings.extra.device_purchase.enabled}"
        )
        return updated


@dataclass(frozen=True)
class UpdateDevicePurchasePriceDto:
    currency: Currency
    raw_value: str


class UpdateDevicePurchasePrice(Interactor[UpdateDevicePurchasePriceDto, Optional[SettingsDto]]):
    required_permission = Permission.SETTINGS_EXTRA

    def __init__(self, uow: UnitOfWork, settings_dao: SettingsDao) -> None:
        self.uow = uow
        self.settings_dao = settings_dao

    async def _execute(
        self, actor: UserDto, data: UpdateDevicePurchasePriceDto
    ) -> Optional[SettingsDto]:
        price = int(data.raw_value.strip())
        if price < DEVICE_PRICE_MIN or price > DEVICE_PRICE_MAX:
            raise ValueError(
                f"Device price must be between {DEVICE_PRICE_MIN} and {DEVICE_PRICE_MAX}"
            )

        async with self.uow:
            settings = await self.settings_dao.get()
            prices = dict(settings.extra.device_purchase.prices)
            prices[data.currency] = price
            settings.extra.device_purchase.prices = prices
            updated = await self.settings_dao.update(settings)
            await self.uow.commit()

        logger.info(f"{actor.log} Set device_purchase price for '{data.currency}': {price}")
        return updated
