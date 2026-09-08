from datetime import UTC, datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.models import FareObservation
from app.db.session import get_session
from app.schemas import (
    AirfareIndexPoint,
    AirfareSearchRequest,
    AirfareSearchResponse,
    CPIDashboardResponse,
    IndexSeriesResponse,
    MapeResponse,
    ScheduleOption,
    SectorOption,
)
from app.services.cpi import build_cpi_dashboard, seed_neon_cpi_data
from app.services.index import (
    DEFAULT_SYNTHETIC_DATASET,
    DEFAULT_SYNTHETIC_SECTOR,
    DEFAULT_SYNTHETIC_STATE,
    build_live_index_series,
    build_mape_comparison,
    build_synthetic_index_series,
)
from app.services.serpapi import SerpApiClient, SerpApiConfigurationError, SerpApiError

router = APIRouter()
settings = get_settings()


@router.post("/airfares/search", response_model=AirfareSearchResponse)
async def search_airfares(
    request: AirfareSearchRequest,
    session: AsyncSession | None = Depends(get_session),
) -> AirfareSearchResponse:
    try:
        offers = await SerpApiClient(settings).search(request)
    except SerpApiConfigurationError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except SerpApiError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    collected_at = datetime.now(UTC)
    if session and offers:
        session.add_all(
            [
                FareObservation(
                    origin=offer.origin,
                    destination=offer.destination,
                    outbound_date=request.outbound_date,
                    return_date=request.return_date,
                    airline=offer.airline,
                    flight_number=offer.flight_number,
                    fare_inr=offer.fare_inr,
                    currency=offer.currency,
                    duration_minutes=offer.duration_minutes,
                    stops=offer.stops,
                    source=offer.source,
                    state=offer.state,
                    sector=offer.sector,
                    captured_at=collected_at,
                    raw_payload=offer.model_dump(mode="json"),
                )
                for offer in offers
            ]
        )
        await session.commit()

    return AirfareSearchResponse(
        route={"origin": request.origin.upper(), "destination": request.destination.upper()},
        query=request,
        source="live",
        offers=offers,
        collected_at=collected_at,
    )


@router.get("/index/series", response_model=IndexSeriesResponse)
async def get_index_series(
    origin: str = Query(default="DEL", min_length=3, max_length=8),
    destination: str = Query(default="BOM", min_length=3, max_length=8),
    data_source: Literal["auto", "live", "synthetic"] = Query(default="auto", alias="source"),
    state: str = Query(default=DEFAULT_SYNTHETIC_STATE, min_length=2, max_length=120),
    sector: Literal["Rural", "Urban", "Combined"] = Query(default=DEFAULT_SYNTHETIC_SECTOR),
    session: AsyncSession | None = Depends(get_session),
) -> IndexSeriesResponse:
    if session is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="DATABASE_URL is not configured")

    live_points: list[AirfareIndexPoint] = []
    if data_source in {"auto", "live"}:
        live_points = await build_live_index_series(session, origin, destination)
    if live_points or data_source == "live":
        return IndexSeriesResponse(
            route={"origin": origin.upper(), "destination": destination.upper()},
            source="live",
            source_label="Live fare observations",
            points=live_points,
        )

    synthetic_points = await build_synthetic_index_series(
        session,
        dataset_key=DEFAULT_SYNTHETIC_DATASET,
        state=state,
        sector=sector,
    )
    if not synthetic_points:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No live or synthetic index observations found")
    return IndexSeriesResponse(
        route={"origin": origin.upper(), "destination": destination.upper()},
        source="synthetic",
        source_label=f"MoSPI CPI Airfare Index · {state} / {sector}",
        fallback_used=data_source == "auto",
        points=synthetic_points,
    )


@router.get("/index/mape", response_model=MapeResponse)
async def get_mape(
    origin: str = Query(default="DEL", min_length=3, max_length=8),
    destination: str = Query(default="BOM", min_length=3, max_length=8),
    session: AsyncSession | None = Depends(get_session),
) -> MapeResponse:
    if session is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="DATABASE_URL is not configured")

    points = await build_mape_comparison(session, origin, destination)
    mape = round(sum(point.absolute_percentage_error for point in points) / len(points), 2) if points else None
    return MapeResponse(
        route={"origin": origin.upper(), "destination": destination.upper()},
        benchmark="MoSPI CPI Airfare Index · All India / Combined",
        points_compared=len(points),
        mape_percent=mape,
        points=points,
    )


@router.get("/dashboard/cpi", response_model=CPIDashboardResponse)
async def get_cpi_dashboard(
    schedule: ScheduleOption = Query(default="next_month"),
    base_year: str = Query(default="2024"),
    year: int = Query(default=2026),
    state: str = Query(default="Arunachal Pradesh"),
    sector: SectorOption = Query(default="rural"),
    session: AsyncSession | None = Depends(get_session),
) -> CPIDashboardResponse:
    if session is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="DATABASE_URL is not configured")

    return await build_cpi_dashboard(
        session=session,
        schedule=schedule,
        base_year=base_year,
        year=year,
        selected_state=state,
        selected_sector=sector,
    )


@router.post("/seed")
async def seed_data(
    session: AsyncSession | None = Depends(get_session),
) -> dict[str, int | str]:
    if session is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="DATABASE_URL is not configured")

    count = await seed_neon_cpi_data(session)
    return {"message": f"Successfully seeded {count} observation records into Neon DB", "count": count}
