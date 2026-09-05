"""Add DEVICES value to purchase_type enum

Revision ID: 0044
Revises: 0043
Create Date: 2026-09-05
"""

from typing import Sequence, Union

from alembic import op

revision: str = "0044"
down_revision: Union[str, None] = "0043"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE purchase_type ADD VALUE IF NOT EXISTS 'DEVICES'")


def downgrade() -> None:
    # PostgreSQL не поддерживает удаление значения из enum-типа
    pass
