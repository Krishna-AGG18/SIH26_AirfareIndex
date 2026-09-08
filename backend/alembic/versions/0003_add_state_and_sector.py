"""add state and sector columns to fare_observations

Revision ID: 0003_add_state_and_sector
Revises: 0002_airfare_index_obs
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003_add_state_and_sector"
down_revision: str | None = "0002_airfare_index_obs"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("fare_observations", sa.Column("state", sa.String(length=64), server_default="All India", nullable=False))
    op.add_column("fare_observations", sa.Column("sector", sa.String(length=16), server_default="urban", nullable=False))
    op.create_index("ix_fare_observations_state", "fare_observations", ["state"])
    op.create_index("ix_fare_observations_sector", "fare_observations", ["sector"])


def downgrade() -> None:
    op.drop_index("ix_fare_observations_sector", table_name="fare_observations")
    op.drop_index("ix_fare_observations_state", table_name="fare_observations")
    op.drop_column("fare_observations", "sector")
    op.drop_column("fare_observations", "state")
