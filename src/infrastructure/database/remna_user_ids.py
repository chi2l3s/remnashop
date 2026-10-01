"""Strict identity mapping for the Remnawave 2.x -> 3.x migration."""

import json
from pathlib import Path
from typing import Any
from uuid import UUID


def load_user_id_map(path: Path) -> dict[UUID, int]:
    raw: Any = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        raise ValueError("Remnawave identity snapshot must be a UUID-to-ID object")
    result: dict[UUID, int] = {}
    for key, value in raw.items():
        if type(value) is not int or not 0 < value <= 2**63 - 1:
            raise ValueError("Remnawave user IDs must be positive bigint integers")
        uuid = UUID(key)
        if uuid in result:
            raise ValueError("Duplicate UUID in Remnawave identity snapshot")
        result[uuid] = value
    if len(set(result.values())) != len(result):
        raise ValueError("Multiple UUIDs point to the same Remnawave user ID")
    return result


def subscription_id_updates(
    subscriptions: list[tuple[int, UUID]], mapping: dict[UUID, int]
) -> list[dict[str, int]]:
    missing = {uuid for _, uuid in subscriptions if uuid not in mapping}
    if missing:
        raise ValueError(
            f"Identity snapshot is missing {len(missing)} subscription UUIDs; migration aborted"
        )
    return [
        {"subscription_id": sub_id, "remna_id": mapping[uuid]} for sub_id, uuid in subscriptions
    ]
