from datetime import UTC, datetime
from typing import Any

import httpx

from app.config import Settings
from app.schemas import AirfareSearchRequest, FareOffer


class SerpApiConfigurationError(RuntimeError):
    """Raised when live collection was requested without an API key."""


class SerpApiError(RuntimeError):
    """Raised when SerpApi returns an error response."""


class SerpApiClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def search(self, request: AirfareSearchRequest) -> list[FareOffer]:
        if not self.settings.serpapi_api_key:
            raise SerpApiConfigurationError("SERPAPI_API_KEY is not configured")

        params: dict[str, str | int] = {
            "engine": "google_flights",
            "departure_id": request.origin.upper(),
            "arrival_id": request.destination.upper(),
            "outbound_date": request.outbound_date.isoformat(),
            "adults": request.adults,
            "currency": request.currency,
            "api_key": self.settings.serpapi_api_key,
        }
        if request.return_date:
            params["return_date"] = request.return_date.isoformat()

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(self.settings.serpapi_base_url, params=params)
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise SerpApiError(f"SerpApi request failed: {exc}") from exc

        payload = response.json()
        if payload.get("error"):
            raise SerpApiError(str(payload["error"]))

        itineraries = payload.get("best_flights", []) + payload.get("other_flights", [])
        return [self._to_offer(itinerary, request) for itinerary in itineraries]

    @staticmethod
    def _to_offer(itinerary: dict[str, Any], request: AirfareSearchRequest) -> FareOffer:
        legs = itinerary.get("flights", [])
        first_leg = legs[0] if legs else {}
        last_leg = legs[-1] if legs else {}
        origin = first_leg.get("departure_airport", {}).get("id", request.origin.upper())
        destination = last_leg.get("arrival_airport", {}).get("id", request.destination.upper())
        airline = first_leg.get("airline", "Unknown airline")
        duration = itinerary.get("total_duration")
        stop_count = max(len(legs) - 1, 0)

        return FareOffer(
            source="live",
            airline=airline,
            flight_number=first_leg.get("flight_number"),
            origin=origin,
            destination=destination,
            departure_time=SerpApiClient._parse_datetime(first_leg.get("departure_airport", {}).get("time")),
            arrival_time=SerpApiClient._parse_datetime(last_leg.get("arrival_airport", {}).get("time")),
            duration_minutes=duration,
            stops=stop_count,
            fare_inr=float(itinerary.get("price", 0)),
            currency="INR",
        )

    @staticmethod
    def _parse_datetime(value: str | None) -> datetime | None:
        if not value:
            return None
        try:
            return datetime.fromisoformat(value).astimezone(UTC)
        except ValueError:
            return None
