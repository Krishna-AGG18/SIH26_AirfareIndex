from collections.abc import Sequence
from datetime import date, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import AirfareIndexObservation, FareObservation
from app.schemas import AirfareIndexPoint, MapeComparisonPoint

DEFAULT_SYNTHETIC_DATASET = "mospi-cpi-airfare-2025-2026"
DEFAULT_SYNTHETIC_STATE = "All India"
DEFAULT_SYNTHETIC_SECTOR = "Combined"


def _as_date(value: date | datetime | object) -> date:
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return date.fromisoformat(str(value))


async def build_live_index_series(
    session: AsyncSession,
    origin: str,
    destination: str,
) -> list[AirfareIndexPoint]:
    day = func.date_trunc("day", FareObservation.captured_at).label("day")
    query = (
        select(day, func.avg(FareObservation.fare_inr).label("average_fare"), func.count(FareObservation.id).label("count"))
        .where(FareObservation.origin == origin.upper(), FareObservation.destination == destination.upper())
        .group_by(day)
        .order_by(day)
    )
    rows: Sequence[tuple[datetime, float, int]] = (await session.execute(query)).all()
    if not rows:
        return []

    baseline = float(rows[0][1])
    return [
        AirfareIndexPoint(
            date=_as_date(row[0]),
            index=round((float(row[1]) / baseline) * 100, 2) if baseline else 100,
            average_fare_inr=round(float(row[1]), 2),
            observations=int(row[2]),
        )
        for row in rows
    ]


async def build_synthetic_index_series(
    session: AsyncSession,
    dataset_key: str = DEFAULT_SYNTHETIC_DATASET,
    state: str = DEFAULT_SYNTHETIC_STATE,
    sector: str = DEFAULT_SYNTHETIC_SECTOR,
) -> list[AirfareIndexPoint]:
    query = (
        select(AirfareIndexObservation.observation_month, AirfareIndexObservation.index_value)
        .where(
            AirfareIndexObservation.dataset_key == dataset_key,
            AirfareIndexObservation.state == state,
            AirfareIndexObservation.sector == sector,
        )
        .order_by(AirfareIndexObservation.observation_month)
    )
    rows: Sequence[tuple[date, float]] = (await session.execute(query)).all()
    return [
        AirfareIndexPoint(
            date=_as_date(row[0]),
            index=round(float(row[1]), 2),
            average_fare_inr=None,
            observations=1,
        )
        for row in rows
    ]


async def build_mape_comparison(
    session: AsyncSession,
    origin: str,
    destination: str,
    dataset_key: str = DEFAULT_SYNTHETIC_DATASET,
) -> list[MapeComparisonPoint]:
    month = func.date_trunc("month", FareObservation.captured_at).label("month")
    live_query = (
        select(month, func.avg(FareObservation.fare_inr).label("average_fare"))
        .where(FareObservation.origin == origin.upper(), FareObservation.destination == destination.upper())
        .group_by(month)
        .order_by(month)
    )
    synthetic_query = (
        select(AirfareIndexObservation.observation_month, AirfareIndexObservation.index_value)
        .where(
            AirfareIndexObservation.dataset_key == dataset_key,
            AirfareIndexObservation.state == DEFAULT_SYNTHETIC_STATE,
            AirfareIndexObservation.sector == DEFAULT_SYNTHETIC_SECTOR,
        )
        .order_by(AirfareIndexObservation.observation_month)
    )
    live_rows = (await session.execute(live_query)).all()
    synthetic_rows = (await session.execute(synthetic_query)).all()
    live_by_month = {_as_date(row[0]).replace(day=1): float(row[1]) for row in live_rows}
    synthetic_by_month = {_as_date(row[0]).replace(day=1): float(row[1]) for row in synthetic_rows}
    overlap = sorted(set(live_by_month) & set(synthetic_by_month))
    if not overlap:
        return []

    observed_baseline = live_by_month[overlap[0]]
    benchmark_baseline = synthetic_by_month[overlap[0]]
    return [
        MapeComparisonPoint(
            month=period,
            observed_index=round((live_by_month[period] / observed_baseline) * 100, 2),
            benchmark_index=round((synthetic_by_month[period] / benchmark_baseline) * 100, 2),
            absolute_percentage_error=round(
                abs(
                    ((live_by_month[period] / observed_baseline) * 100)
                    - ((synthetic_by_month[period] / benchmark_baseline) * 100)
                )
                / abs((synthetic_by_month[period] / benchmark_baseline) * 100)
                * 100,
                2,
            ),
        )
        for period in overlap
    ]
