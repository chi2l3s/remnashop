from typing import Optional, Protocol, runtime_checkable

from src.application.dto.device_purchase import DevicePurchaseDto


@runtime_checkable
class DevicePurchaseDao(Protocol):
    async def create(self, purchase: DevicePurchaseDto) -> DevicePurchaseDto: ...

    async def get_by_subscription(self, subscription_id: int) -> list[DevicePurchaseDto]: ...

    async def get_by_id(self, purchase_id: int) -> Optional[DevicePurchaseDto]: ...
