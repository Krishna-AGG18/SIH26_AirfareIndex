from collections.abc import Sequence
from datetime import date, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import FareObservation
from app.schemas import AirfareIndexPoint


async def build_index_series(
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
            date=row[0].date() if isinstance(row[0], datetime) else date.fromisoformat(str(row[0])),
            index=round((float(row[1]) / baseline) * 100, 2) if baseline else 100,
            average_fare_inr=round(float(row[1]), 2),
            observations=int(row[2]),
        )
        for row in rows
    ]
