"""Migrate Remnawave user UUIDs to v3 numeric IDs without changing subscriptions."""

import os
from pathlib import Path
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

from src.infrastructure.database.remna_user_ids import load_user_id_map, subscription_id_updates

revision: str = "0045"
down_revision: Union[str, None] = "0044"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    connection = op.get_bind()
    connection.execute(sa.text("LOCK TABLE subscriptions IN ACCESS EXCLUSIVE MODE"))
    subscriptions = [
        (row.id, row.user_remna_id)
        for row in connection.execute(sa.text("SELECT id, user_remna_id FROM subscriptions"))
    ]
    updates: list[dict[str, int]] = []
    if subscriptions:
        snapshot_path = os.environ.get("REMNAWAVE_V3_ID_MAP_PATH")
        if not snapshot_path:
            raise ValueError(
                "Export the panel's v2 UUID-to-t_id snapshot before upgrading and set "
                "REMNAWAVE_V3_ID_MAP_PATH. Existing subscriptions will not be guessed or deleted."
            )
        updates = subscription_id_updates(subscriptions, load_user_id_map(Path(snapshot_path)))

    op.add_column("subscriptions", sa.Column("remna_numeric_id", sa.BigInteger(), nullable=True))
    if updates:
        connection.execute(
            sa.text(
                "UPDATE subscriptions SET remna_numeric_id=:remna_id WHERE id=:subscription_id"
            ),
            updates,
        )
    op.drop_index("ix_subscriptions_user_remna_id", table_name="subscriptions")
    op.alter_column(
        "subscriptions", "user_remna_id", new_column_name="legacy_remna_uuid", nullable=True
    )
    op.alter_column(
        "subscriptions", "remna_numeric_id", new_column_name="user_remna_id", nullable=False
    )
    op.create_index("ix_subscriptions_user_remna_id", "subscriptions", ["user_remna_id"])


def downgrade() -> None:
    connection = op.get_bind()
    connection.execute(sa.text("LOCK TABLE subscriptions IN ACCESS EXCLUSIVE MODE"))
    if connection.scalar(
        sa.text("SELECT count(*) FROM subscriptions WHERE legacy_remna_uuid IS NULL")
    ):
        raise ValueError(
            "New v3 subscriptions exist; restore a coordinated panel/bot backup instead"
        )
    op.drop_index("ix_subscriptions_user_remna_id", table_name="subscriptions")
    op.drop_column("subscriptions", "user_remna_id")
    op.alter_column(
        "subscriptions", "legacy_remna_uuid", new_column_name="user_remna_id", nullable=False
    )
    op.create_index("ix_subscriptions_user_remna_id", "subscriptions", ["user_remna_id"])
