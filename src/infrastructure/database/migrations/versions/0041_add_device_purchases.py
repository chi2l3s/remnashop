"""Add device purchases and extra_devices field

Revision ID: 0041
Revises: 0040
Create Date: 2026-09-04
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0041"
down_revision: Union[str, None] = "0040"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Добавляем поле extra_devices в таблицу subscriptions
    op.add_column(
        "subscriptions",
        sa.Column("extra_devices", sa.Integer(), server_default="0", nullable=False),
    )

    # Создаем таблицу device_purchases
    op.create_table(
        "device_purchases",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("subscription_id", sa.Integer(), nullable=False),
        sa.Column("devices_added", sa.Integer(), nullable=False),
        sa.Column("price_per_device", sa.Numeric(10, 2), nullable=False),
        sa.Column("total_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("currency", sa.String(), nullable=False),
        sa.Column("payment_id", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["subscription_id"],
            ["subscriptions.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_device_purchases_subscription_id"),
        "device_purchases",
        ["subscription_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_device_purchases_user_id"), "device_purchases", ["user_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_device_purchases_user_id"), table_name="device_purchases")
    op.drop_index(op.f("ix_device_purchases_subscription_id"), table_name="device_purchases")
    op.drop_table("device_purchases")
    op.drop_column("subscriptions", "extra_devices")
