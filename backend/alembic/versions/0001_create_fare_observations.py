"""create fare observations

Revision ID: 0001_create_fare_observations
Revises:
"""
from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0001_create_fare_observations"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "fare_observations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("origin", sa.String(length=8), nullable=False),
        sa.Column("destination", sa.String(length=8), nullable=False),
        sa.Column("outbound_date", sa.Date(), nullable=False),
        sa.Column("return_date", sa.Date(), nullable=True),
        sa.Column("airline", sa.String(length=120), nullable=False),
        sa.Column("flight_number", sa.String(length=32), nullable=True),
        sa.Column("fare_inr", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=True),
        sa.Column("stops", sa.Integer(), nullable=False),
        sa.Column("source", sa.String(length=24), nullable=False),
        sa.Column("captured_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("raw_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_fare_observations_origin", "fare_observations", ["origin"])
    op.create_index("ix_fare_observations_destination", "fare_observations", ["destination"])
    op.create_index("ix_fare_observations_outbound_date", "fare_observations", ["outbound_date"])
    op.create_index("ix_fare_observations_source", "fare_observations", ["source"])
    op.create_index("ix_fare_observations_captured_at", "fare_observations", ["captured_at"])


def downgrade() -> None:
    op.drop_index("ix_fare_observations_captured_at", table_name="fare_observations")
    op.drop_index("ix_fare_observations_source", table_name="fare_observations")
    op.drop_index("ix_fare_observations_outbound_date", table_name="fare_observations")
    op.drop_index("ix_fare_observations_destination", table_name="fare_observations")
    op.drop_index("ix_fare_observations_origin", table_name="fare_observations")
    op.drop_table("fare_observations")
