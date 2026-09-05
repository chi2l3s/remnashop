"""Add device purchase settings

Revision ID: 0042
Revises: 0041
Create Date: 2026-09-04
"""

from typing import Sequence, Union

from alembic import op

revision: str = "0042"
down_revision: Union[str, None] = "0041"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Добавляем настройки device_purchase в существующую запись settings
    op.execute(
        """
        UPDATE settings
        SET extra = extra
            || '{"device_purchase": {"enabled": true,'
            || ' "prices": {"USD": 5, "RUB": 500, "XTR": 50}}}'::jsonb
        WHERE NOT (extra ? 'device_purchase')
    """
    )


def downgrade() -> None:
    # Удаляем настройки device_purchase
    op.execute(
        """
        UPDATE settings
        SET extra = extra - 'device_purchase'
    """
    )
