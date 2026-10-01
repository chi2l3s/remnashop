"""Export v2 identities before upgrading. Run as root on the Docker host."""

import argparse
import json
import os
import subprocess
from collections import Counter
from pathlib import Path


def query(container: str, sql: str) -> list[dict]:
    result = subprocess.run(
        [
            "docker",
            "exec",
            "-i",
            container,
            "sh",
            "-c",
            'psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atq',
        ],
        input=f"SELECT coalesce(json_agg(t), '[]'::json) FROM ({sql}) t;",
        text=True,
        check=True,
        capture_output=True,
    )
    return json.loads(result.stdout)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    panel_users = query(
        "remnawave-db",
        "SELECT uuid::text, t_id AS id, vless_uuid::text, short_uuid FROM users",
    )
    subscriptions = query(
        "remnashop-db",
        "SELECT s.id, s.user_remna_id::text, s.status::text, s.url, "
        "EXISTS (SELECT 1 FROM users u WHERE u.current_subscription_id=s.id) AS is_current "
        "FROM subscriptions s",
    )
    mapping = {user["uuid"]: user["id"] for user in panel_users}
    missing = [sub for sub in subscriptions if sub["user_remna_id"] not in mapping]
    os.umask(0o077)
    args.output.mkdir(parents=True, exist_ok=True, mode=0o700)
    for name, payload in (
        ("user-id-map.json", mapping),
        ("panel-user-identities.json", panel_users),
        ("bot-subscription-identities.json", subscriptions),
    ):
        (args.output / name).write_text(json.dumps(payload), encoding="utf-8")
        (args.output / name).chmod(0o600)
    print(  # noqa: T201
        json.dumps(
            {
                "panel_users": len(panel_users),
                "subscriptions": len(subscriptions),
                "mapped_subscriptions": len(subscriptions) - len(missing),
                "unmapped_by_status": dict(Counter(sub["status"] for sub in missing)),
                "unmapped_current": sum(sub["is_current"] for sub in missing),
            }
        )
    )


if __name__ == "__main__":
    main()
