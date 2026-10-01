import json
from datetime import datetime, timedelta, timezone
from uuid import UUID

import httpx
import pytest
from remnapy import RemnawaveSDK
from remnapy.enums import TrafficLimitStrategy

from src.application.dto import PlanSnapshotDto, RemnaSubscriptionDto, SubscriptionDto, UserDto
from src.core.enums import SubscriptionStatus
from src.infrastructure.database.remna_user_ids import load_user_id_map, subscription_id_updates
from src.infrastructure.services.remnawave import RemnawaveImpl

USER_UUID = UUID("e8a3fdd2-43c3-413e-a808-b8495c080b2b")
NOW = datetime(2026, 10, 1, tzinfo=timezone.utc)


def user_payload(user_id=42):
    return {
        "id": user_id,
        "shortUuid": "existing-subscription",
        "username": "remna_12345",
        "expireAt": (NOW + timedelta(days=30)).isoformat(),
        "telegramId": 12345,
        "trafficLimitBytes": 10737418240,
        "trojanPassword": "test-password",
        "vlessUuid": str(USER_UUID),
        "ssPassword": "test-password",
        "createdAt": NOW.isoformat(),
        "updatedAt": NOW.isoformat(),
        "subscriptionUrl": "https://example.test/existing-subscription",
        "activeInternalSquads": [],
        "userTraffic": {"usedTrafficBytes": 10, "lifetimeUsedTrafficBytes": 100},
    }


def subscription():
    return SubscriptionDto(
        id=7,
        user_id=9,
        user_remna_id=42,
        traffic_limit=10,
        device_limit=2,
        extra_devices=1,
        traffic_limit_strategy=TrafficLimitStrategy.NO_RESET,
        expire_at=NOW + timedelta(days=30),
        url="https://example.test/existing-subscription",
        plan_snapshot=PlanSnapshotDto.test(),
    )


def test_mapping_preserves_duplicate_subscription_history(tmp_path):
    path = tmp_path / "map.json"
    path.write_text(json.dumps({str(USER_UUID): 2**40}))
    mapping = load_user_id_map(path)
    assert subscription_id_updates([(7, USER_UUID), (8, USER_UUID)], mapping) == [
        {"subscription_id": 7, "remna_id": 2**40},
        {"subscription_id": 8, "remna_id": 2**40},
    ]


@pytest.mark.parametrize("value", [True, "42", 0, -1, 1.5, 2**63])
def test_mapping_rejects_invalid_ids(tmp_path, value):
    path = tmp_path / "map.json"
    path.write_text(json.dumps({str(USER_UUID): value}))
    with pytest.raises(ValueError, match="bigint"):
        load_user_id_map(path)


def test_missing_identity_aborts_without_guessing():
    with pytest.raises(ValueError, match="migration aborted"):
        subscription_id_updates([(7, USER_UUID)], {})


def test_sync_preserves_local_primary_key_and_credentials():
    sub = subscription()
    source = RemnaSubscriptionDto(
        remna_id=42,
        status=SubscriptionStatus.ACTIVE,
        expire_at=sub.expire_at,
        url=sub.url,
        traffic_limit=10,
        device_limit=3,
        traffic_limit_strategy=TrafficLimitStrategy.NO_RESET,
    )
    service = RemnawaveImpl(None)
    service.apply_sync(sub, source)
    assert sub.id == 7
    assert sub.user_id == 9
    assert sub.user_remna_id == 42
    assert sub.url == "https://example.test/existing-subscription"
    assert sub.extra_devices == 0  # Existing sync semantics: panel's limit is the combined limit.


@pytest.mark.asyncio
async def test_numeric_user_routes_update_and_empty_delete():
    requests = []

    def handle(request):
        requests.append(request)
        if request.method == "DELETE":
            return httpx.Response(204)
        return httpx.Response(200, json={"response": user_payload()})

    async with httpx.AsyncClient(
        base_url="https://panel.test/api", transport=httpx.MockTransport(handle)
    ) as client:
        service = RemnawaveImpl(RemnawaveSDK(client))
        remote = await service.get_user_by_id(42)
        assert remote.id == 42
        await service.update_user(
            UserDto(name="Test", telegram_id=12345), 42, subscription=subscription()
        )
        assert requests[0].url.path == "/api/users/42"
        body = json.loads(requests[1].content)
        assert body["id"] == 42
        assert body["hwidDeviceLimit"] == 3
        assert "uuid" not in body
        assert "vlessUuid" not in body
        assert "shortUuid" not in body
        assert await service.delete_user(42) is True


def test_create_does_not_reuse_removed_user_identity():
    body = (
        RemnawaveImpl(None)
        ._build_create_request(UserDto(name="Test", telegram_id=12345), None, subscription())
        .model_dump(by_alias=True, exclude_unset=True)
    )
    assert "id" not in body and "uuid" not in body


@pytest.mark.asyncio
async def test_stream_lookup_paginates_and_uses_telegram_filter():
    requests = []

    def handle(request):
        requests.append(request)
        more = len(requests) == 1
        return httpx.Response(
            200,
            json={
                "response": {
                    "users": [user_payload(42 if more else 43)],
                    "hasMore": more,
                    "nextCursor": "42" if more else None,
                }
            },
        )

    async with httpx.AsyncClient(
        base_url="https://panel.test/api", transport=httpx.MockTransport(handle)
    ) as client:
        users = await RemnawaveImpl(RemnawaveSDK(client)).get_users_by_telegram_id(12345)
    assert [u.id for u in users] == [42, 43]
    assert all(r.url.params["telegramId"] == "12345" for r in requests)
    assert requests[1].url.params["cursor"] == "42"


@pytest.mark.asyncio
async def test_hwid_and_drop_connections_use_user_id():
    requests = []

    def handle(request):
        requests.append(request)
        if request.url.path.endswith("/connections/drop"):
            return httpx.Response(204)
        return httpx.Response(200, json={"response": {"total": 0, "devices": []}})

    async with httpx.AsyncClient(
        base_url="https://panel.test/api", transport=httpx.MockTransport(handle)
    ) as client:
        service = RemnawaveImpl(RemnawaveSDK(client))
        assert await service.get_devices(42) == []
        assert await service.delete_device(42, "test-hwid") == 0
        await service.delete_all_devices(42)
        await service.drop_connections(42)
    assert requests[0].url.path == "/api/hwid/devices/42"
    assert json.loads(requests[1].content) == {"userId": 42, "hwid": "test-hwid"}
    assert json.loads(requests[2].content) == {"userId": 42}
    assert json.loads(requests[3].content)["dropBy"] == {"by": "userIds", "userIds": [42]}
