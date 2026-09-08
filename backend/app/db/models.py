import uuid
from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    Float,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class FareObservation(Base):
    __tablename__ = "fare_observations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    origin: Mapped[str] = mapped_column(String(8), index=True)
    destination: Mapped[str] = mapped_column(String(8), index=True)
    outbound_date: Mapped[date] = mapped_column(Date, index=True)
    return_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    airline: Mapped[str] = mapped_column(String(120))
    flight_number: Mapped[str | None] = mapped_column(String(32), nullable=True)
    fare_inr: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    stops: Mapped[int] = mapped_column(Integer, default=0)
    source: Mapped[str] = mapped_column(String(24), default="live", index=True)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    raw_payload: Mapped[dict] = mapped_column(JSONB, default=dict)


class AirfareIndexObservation(Base):
    __tablename__ = "airfare_index_observations"
    __table_args__ = (
        UniqueConstraint(
            "dataset_key",
            "observation_month",
            "state",
            "sector",
            "code",
            name="uq_airfare_index_observation_key",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_key: Mapped[str] = mapped_column(String(120), index=True)
    source_name: Mapped[str] = mapped_column(String(160))
    source_file: Mapped[str] = mapped_column(String(255))
    source_sha256: Mapped[str] = mapped_column(String(64))
    base_year: Mapped[int] = mapped_column(Integer)
    series: Mapped[str] = mapped_column(String(32))
    observation_month: Mapped[date] = mapped_column(Date, index=True)
    state: Mapped[str] = mapped_column(String(120), index=True)
    sector: Mapped[str] = mapped_column(String(16), index=True)
    division: Mapped[str] = mapped_column(String(120))
    group_name: Mapped[str] = mapped_column(String(160))
    class_name: Mapped[str] = mapped_column(String(160))
    sub_class: Mapped[str] = mapped_column(String(160))
    item: Mapped[str] = mapped_column(String(120))
    code: Mapped[str] = mapped_column(String(40), index=True)
    index_value: Mapped[float] = mapped_column(Numeric(12, 2))
    inflation_yoy: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    imputation: Mapped[bool] = mapped_column(default=False)
    imported_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
