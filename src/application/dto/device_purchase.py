from dataclasses import dataclass
from decimal import Decimal

from src.core.enums import Currency

from .base import BaseDto, TimestampMixin, TrackableMixin


@dataclass(kw_only=True)
class DevicePurchaseDto(BaseDto, TrackableMixin, TimestampMixin):
    user_id: int
    subscription_id: int

    devices_added: int
    price_per_device: Decimal
    total_price: Decimal
    currency: Currency

    payment_id: str | None = None
