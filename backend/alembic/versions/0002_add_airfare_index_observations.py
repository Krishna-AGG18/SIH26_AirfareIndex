"""add MoSPI synthetic airfare index observations

Revision ID: 0002_airfare_index_obs
Revises: 0001_create_fare_observations
"""
from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0002_airfare_index_obs"
down_revision: str | None = "0001_create_fare_observations"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "airfare_index_observations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("dataset_key", sa.String(length=120), nullable=False),
        sa.Column("source_name", sa.String(length=160), nullable=False),
        sa.Column("source_file", sa.String(length=255), nullable=False),
        sa.Column("source_sha256", sa.String(length=64), nullable=False),
        sa.Column("base_year", sa.Integer(), nullable=False),
        sa.Column("series", sa.String(length=32), nullable=False),
        sa.Column("observation_month", sa.Date(), nullable=False),
        sa.Column("state", sa.String(length=120), nullable=False),
        sa.Column("sector", sa.String(length=16), nullable=False),
        sa.Column("division", sa.String(length=120), nullable=False),
        sa.Column("group_name", sa.String(length=160), nullable=False),
        sa.Column("class_name", sa.String(length=160), nullable=False),
        sa.Column("sub_class", sa.String(length=160), nullable=False),
        sa.Column("item", sa.String(length=120), nullable=False),
        sa.Column("code", sa.String(length=40), nullable=False),
        sa.Column("index_value", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("inflation_yoy", sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column("imputation", sa.Boolean(), nullable=False),
        sa.Column("imported_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "dataset_key",
            "observation_month",
            "state",
            "sector",
            "code",
            name="uq_airfare_index_observation_key",
        ),
    )
    op.create_index("ix_airfare_index_observations_dataset_key", "airfare_index_observations", ["dataset_key"])
    op.create_index("ix_airfare_index_observations_observation_month", "airfare_index_observations", ["observation_month"])
    op.create_index("ix_airfare_index_observations_state", "airfare_index_observations", ["state"])
    op.create_index("ix_airfare_index_observations_sector", "airfare_index_observations", ["sector"])
    op.create_index("ix_airfare_index_observations_code", "airfare_index_observations", ["code"])


def downgrade() -> None:
    op.drop_index("ix_airfare_index_observations_code", table_name="airfare_index_observations")
    op.drop_index("ix_airfare_index_observations_sector", table_name="airfare_index_observations")
    op.drop_index("ix_airfare_index_observations_state", table_name="airfare_index_observations")
    op.drop_index("ix_airfare_index_observations_observation_month", table_name="airfare_index_observations")
    op.drop_index("ix_airfare_index_observations_dataset_key", table_name="airfare_index_observations")
    op.drop_table("airfare_index_observations")
