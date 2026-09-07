from fastapi import HTTPException

from src.application.common import Remnawave
from src.application.common.dao import SubscriptionDao, UserDao
from src.application.dto import SubscriptionDto, UserDto
from src.application.use_cases.remnawave.commands.synchronization import (
    SyncRemnaUser,
    SyncRemnaUserDto,
)


async def resolve_panel_subscription(
    user: UserDto,
    subscription_dao: SubscriptionDao,
    user_dao: UserDao,
    remnawave: Remnawave,
    sync_remna_user: SyncRemnaUser,
) -> SubscriptionDto | None:
    """Import a missing subscription using only the authenticated account's Telegram ID."""
    current = await subscription_dao.get_current(user.id)
    if current or user.telegram_id is None:
        return current

    matches = await remnawave.get_users_by_telegram_id(user.telegram_id)
    if not matches:
        return None
    if len(matches) != 1 or matches[0].telegram_id != user.telegram_id:
        raise HTTPException(
            status_code=409,
            detail="Не удалось однозначно определить подписку в панели. Обратитесь в поддержку.",
        )
    panel_user = matches[0]
    owner = await user_dao.get_by_remna_uuid(panel_user.uuid)
    if owner and owner.id != user.id:
        raise HTTPException(status_code=409, detail="Подписка уже связана с другим аккаунтом.")

    await sync_remna_user.system(SyncRemnaUserDto(panel_user, creating=False))
    return await subscription_dao.get_current(user.id)
