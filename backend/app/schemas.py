from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

ObservationSource = Literal["live", "synthetic"]


class AirfareSearchRequest(BaseModel):
    origin: str = Field(min_length=3, max_length=8, examples=["DEL"])
    destination: str = Field(min_length=3, max_length=8, examples=["BOM"])
    outbound_date: date
    return_date: date | None = None
    adults: int = Field(default=1, ge=1, le=9)
    currency: Literal["INR"] = "INR"


class FareOffer(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID | None = None
    source: ObservationSource
    airline: str
    flight_number: str | None = None
    origin: str
    destination: str
    departure_time: datetime | None = None
    arrival_time: datetime | None = None
    duration_minutes: int | None = None
    stops: int = 0
    fare_inr: float
    currency: Literal["INR"] = "INR"


class AirfareSearchResponse(BaseModel):
    route: dict[str, str]
    query: AirfareSearchRequest
    source: ObservationSource
    offers: list[FareOffer]
    collected_at: datetime


class AirfareIndexPoint(BaseModel):
    date: date
    index: float
    average_fare_inr: float
    observations: int


class IndexSeriesResponse(BaseModel):
    route: dict[str, str]
    points: list[AirfareIndexPoint]
