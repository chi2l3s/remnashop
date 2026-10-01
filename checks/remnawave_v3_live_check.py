"""Read-only production verification; optional writes require an isolated rehearsal network."""

import argparse
import asyncio
import json
import os
from datetime import timedelta
from pathlib import Path
from uuid import UUID, uuid4

import httpx
from loguru import logger
from remnapy import RemnawaveSDK
from remnapy.models import CreateUserHwidDeviceRequestDto
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from src.__main__ import application
from src.application.dto import PlanSnapshotDto, RemnaSubscriptionDto, UserDto
from src.core.config import AppConfig
from src.core.utils.time import datetime_now
from src.infrastructure.database.remna_user_ids import load_user_id_map
from src.infrastructure.services.remnawave import RemnawaveImpl
from src.web.endpoints.public._common import generate_access_token


async def verify(snapshot: Path, write_test: bool) -> None:
    if write_test and os.environ.get("REMNAWAVE_V3_ISOLATED_TEST") != "true":
        raise ValueError("Write checks are allowed only in the explicitly isolated rehearsal")
    logger.disable("src")
    config = AppConfig.get()
    mapping = load_user_id_map(snapshot / "user-id-map.json")
    old_users = json.loads((snapshot / "panel-user-identities.json").read_text())
    old_subscriptions = json.loads((snapshot / "bot-subscription-identities.json").read_text())
    headers = {
        "Authorization": f"Bearer {config.remnawave.token.get_secret_value()}",
        "X-Api-Key": config.remnawave.caddy_token.get_secret_value(),
        "x-forwarded-proto": "https",
        "x-forwarded-for": "127.0.0.1",
    }
    async with httpx.AsyncClient(
        base_url=f"{config.remnawave.url.get_secret_value()}/api",
        headers=headers,
        cookies=config.remnawave.cookies,
        timeout=30,
    ) as client:
        sdk = RemnawaveSDK(client)
        service = RemnawaveImpl(sdk)
        version = await service.try_connection()
        users = await service.get_all_users(1000, 0)
        by_id = {u.id: u for u in users}
        for old in old_users:
            user = by_id[old["id"]]
            assert str(user.vless_uuid) == old["vless_uuid"], "VLESS credential changed"
            assert user.short_uuid == old["short_uuid"], "Subscription identifier changed"
            RemnaSubscriptionDto.from_remna_user(user)
        engine = create_async_engine(config.database.dsn)
        try:
            async with engine.connect() as connection:
                statement = text(
                    "SELECT id, user_remna_id, legacy_remna_uuid, url FROM subscriptions"
                )
                rows = (await connection.execute(statement)).mappings().all()
                by_subscription = {row["id"]: row for row in rows}
                for old in old_subscriptions:
                    row = by_subscription[old["id"]]
                    assert row["user_remna_id"] == mapping[UUID(old["user_remna_id"])]
                    assert str(row["legacy_remna_uuid"]) == old["user_remna_id"]
                    if "url" in old:
                        assert row["url"] == old["url"], "Stored subscription URL changed"
                web_user_id = await connection.scalar(
                    text(
                        "SELECT id FROM users WHERE current_subscription_id IS NOT NULL "
                        "AND NOT is_blocked ORDER BY (telegram_id=:owner_id) DESC LIMIT 1"
                    ),
                    {"owner_id": config.bot.owner_id},
                )
        finally:
            await engine.dispose()
        user = next(u for u in users if u.telegram_id)
        assert await service.get_user_by_id(user.id) is not None
        assert any(
            u.id == user.id for u in await service.get_users_by_telegram_id(user.telegram_id)
        )
        await service.get_devices(user.id)
        await service.get_internal_squads()
        await service.get_external_squads()
        await sdk.system.get_stats()
        nodes = await sdk.nodes.get_all_nodes()
        await sdk.hosts.get_all_hosts()
        await sdk.inbounds.get_all_inbounds()
        web_checks = await exercise_web_reads(config, web_user_id)
        if write_test:
            await exercise_writes(service, sdk)
        print(  # noqa: T201
            json.dumps(
                {
                    "panel_version": str(version),
                    "panel_users_verified": len(old_users),
                    "subscriptions_verified": len(old_subscriptions),
                    "write_test": write_test,
                    "web_api": web_checks,
                    "nodes": [{"name": n.name, "connected": n.is_connected} for n in nodes.root],
                }
            )
        )


async def exercise_web_reads(config: AppConfig, user_id: int) -> dict[str, int]:
    app = application()  # No lifespan: no Telegram webhook/command writes or workers.
    token, _ = generate_access_token(user_id, config.jwt_secret.get_secret_value())
    statuses: dict[str, int] = {}
    try:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="https://webapp.test"
        ) as client:
            unauthorized = await client.get("/api/v1/public/subscription/current")
            assert unauthorized.status_code == 401
            client.cookies.set("access_token", token)
            for path in (
                "/health",
                "/api/v1/public/subscription/current",
                "/api/v1/public/subscription/devices",
                "/api/v1/public/subscription/offers",
            ):
                response = await client.get(path)
                assert response.status_code == 200, f"Web API {path}: HTTP {response.status_code}"
                statuses[path] = response.status_code
                if path.endswith("/current"):
                    assert int(response.json()["user_remna_id"]) > 0
    finally:
        await app.state.dishka_container.close()
    return statuses


async def exercise_writes(service: RemnawaveImpl, sdk: RemnawaveSDK) -> None:
    """Create a disposable user, never mutate a real subscription."""
    user = UserDto(name="Migration rehearsal", email=f"check-{uuid4().hex[:8]}@example.com")
    # Remna name for browser users is derived from the local ID.
    user.id = 2000000000
    plan = PlanSnapshotDto.test()
    plan.duration = 30
    plan.device_limit = 2
    remote = await service.create_user(user, plan=plan)
    try:
        plan.duration = 60
        updated = await service.update_user(user, remote.id, plan=plan)
        assert updated.expire_at > datetime_now() + timedelta(days=59)
        assert updated.short_uuid == remote.short_uuid
        assert updated.vless_uuid == remote.vless_uuid
        hwid = f"migration-rehearsal-{uuid4().hex}"
        await sdk.hwid.add_hwid_to_users(
            CreateUserHwidDeviceRequestDto(user_id=remote.id, hwid=hwid)
        )
        assert any(d.hwid == hwid for d in await service.get_devices(remote.id))
        await service.delete_device(remote.id, hwid)
        assert await service.get_devices(remote.id) == []
        await service.delete_all_devices(remote.id)
        await service.drop_connections(remote.id)
    finally:
        assert await service.delete_user(remote.id)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--snapshot", type=Path, required=True)
    parser.add_argument("--isolated-write-test", action="store_true")
    args = parser.parse_args()
    asyncio.run(verify(args.snapshot, args.isolated_write_test))


if __name__ == "__main__":
    main()
