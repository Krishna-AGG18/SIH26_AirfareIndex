from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.models import FareObservation
from app.db.session import get_session
from app.schemas import (
    AirfareIndexPoint,
    AirfareSearchRequest,
    AirfareSearchResponse,
    IndexSeriesResponse,
)
from app.services.index import build_index_series
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
    session: AsyncSession | None = Depends(get_session),
) -> IndexSeriesResponse:
    if session is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="DATABASE_URL is not configured")

    points: list[AirfareIndexPoint] = await build_index_series(session, origin, destination)
    return IndexSeriesResponse(
        route={"origin": origin.upper(), "destination": destination.upper()},
        points=points,
    )
