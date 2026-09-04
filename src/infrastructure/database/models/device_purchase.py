from decimal import Decimal
from typing import Optional

from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from src.core.enums import Currency

from .base import BaseSql
from .timestamp import TimestampMixin


class DevicePurchase(BaseSql, TimestampMixin):
    """История покупок дополнительных устройств."""

    __tablename__ = "device_purchases"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    subscription_id: Mapped[int] = mapped_column(
        ForeignKey("subscriptions.id", ondelete="CASCADE"),
        index=True,
    )

    devices_added: Mapped[int]
    price_per_device: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    total_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    currency: Mapped[Currency]

    payment_id: Mapped[Optional[str]]
