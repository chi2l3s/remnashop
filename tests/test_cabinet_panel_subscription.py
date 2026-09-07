from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

from src.web.panel_subscription import resolve_panel_subscription


def dependencies(matches=None, owner=None, current=None):
    user = SimpleNamespace(id=7, telegram_id=123)
    subscriptions = SimpleNamespace(get_current=AsyncMock(return_value=current))
    users = SimpleNamespace(get_by_remna_uuid=AsyncMock(return_value=owner))
    panel = SimpleNamespace(get_users_by_telegram_id=AsyncMock(return_value=matches or []))
    sync = SimpleNamespace(system=AsyncMock())
    return user, subscriptions, users, panel, sync


async def test_imports_by_authenticated_telegram_id():
    match = SimpleNamespace(uuid="panel-uuid", telegram_id=123)
    args = dependencies([match])
    subscription = SimpleNamespace(id=42)
    args[1].get_current.side_effect = [None, subscription]
    assert await resolve_panel_subscription(*args) is subscription
    args[3].get_users_by_telegram_id.assert_awaited_once_with(123)
    imported = args[4].system.call_args.args[0]
    assert imported.remna_user is match
    assert imported.creating is False


@pytest.mark.parametrize("matches", [
    [SimpleNamespace(uuid="a", telegram_id=999)],
    [SimpleNamespace(uuid="a", telegram_id=123), SimpleNamespace(uuid="b", telegram_id=123)],
])
async def test_rejects_mismatched_or_ambiguous_panel_identity(matches):
    args = dependencies(matches)
    with pytest.raises(HTTPException) as error:
        await resolve_panel_subscription(*args)
    assert error.value.status_code == 409
    args[4].system.assert_not_awaited()


async def test_cannot_claim_another_accounts_subscription():
    args = dependencies(
        [SimpleNamespace(uuid="a", telegram_id=123)], owner=SimpleNamespace(id=8)
    )
    with pytest.raises(HTTPException):
        await resolve_panel_subscription(*args)
    args[4].system.assert_not_awaited()


async def test_existing_subscription_is_preserved():
    current = SimpleNamespace(id=42)
    args = dependencies(current=current)
    assert await resolve_panel_subscription(*args) is current
    args[3].get_users_by_telegram_id.assert_not_awaited()


async def test_email_only_user_is_not_looked_up_by_arbitrary_id():
    args = dependencies()
    args[0].telegram_id = None
    assert await resolve_panel_subscription(*args) is None
    args[3].get_users_by_telegram_id.assert_not_awaited()
