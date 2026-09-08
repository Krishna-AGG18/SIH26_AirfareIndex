from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

ObservationSource = Literal["live", "synthetic"]


def to_camel(value: str) -> str:
    head, *tail = value.split("_")
    return head + "".join(part.capitalize() for part in tail)


class ApiModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class AirfareSearchRequest(ApiModel):
    origin: str = Field(min_length=3, max_length=8, examples=["DEL"])
    destination: str = Field(min_length=3, max_length=8, examples=["BOM"])
    outbound_date: date
    return_date: date | None = None
    adults: int = Field(default=1, ge=1, le=9)
    currency: Literal["INR"] = "INR"


class FareOffer(ApiModel):

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


class AirfareSearchResponse(ApiModel):
    route: dict[str, str]
    query: AirfareSearchRequest
    source: ObservationSource
    offers: list[FareOffer]
    collected_at: datetime


class AirfareIndexPoint(ApiModel):
    date: date
    index: float
    average_fare_inr: float | None = None
    observations: int


class IndexSeriesResponse(ApiModel):
    route: dict[str, str]
    source: ObservationSource
    source_label: str
    fallback_used: bool = False
    points: list[AirfareIndexPoint]


class MapeComparisonPoint(ApiModel):
    month: date
    observed_index: float
    benchmark_index: float
    absolute_percentage_error: float


class MapeResponse(ApiModel):
    route: dict[str, str]
    benchmark: str
    points_compared: int
    mape_percent: float | None
    points: list[MapeComparisonPoint]
