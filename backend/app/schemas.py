from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

ObservationSource = Literal["live", "synthetic"]
ScheduleOption = Literal["today", "next_week", "next_month", "next_45_days"]
SectorOption = Literal["rural", "urban", "combined"]


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
    state: str | None = None
    sector: SectorOption = "urban"


class FareOffer(ApiModel):
    id: UUID | None = None
    source: ObservationSource
    airline: str
    flight_number: str | None = None
    origin: str
    destination: str
    state: str = "All India"
    sector: SectorOption = "urban"
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


class CPIChartPoint(BaseModel):
    label: str
    date: str
    index: float
    average_fare_inr: float
    observations: int
    inflation_yoy: float = 0.0
    inflation_mom: float = 0.0


class StateSummary(BaseModel):
    state: str
    sector: str
    cpi_index: float
    average_fare_inr: float
    observations: int


class InflationComparisonPoint(BaseModel):
    month: str
    airfare_inflation: float
    general_inflation: float


class CPIInflationCombinedPoint(BaseModel):
    month: str
    cpi_index: float
    inflation_rate: float


class YoYInflationPoint(BaseModel):
    month: str
    inflation_rate: float


class CPIDashboardResponse(BaseModel):
    schedule: ScheduleOption
    base_year: str
    year: int = 2026
    selected_state: str
    selected_sector: SectorOption
    rural_series: list[CPIChartPoint]
    urban_series: list[CPIChartPoint]
    combined_series: list[CPIChartPoint]
    state_series: list[CPIChartPoint]
    states_summary: list[StateSummary]
    available_states: list[str]
    total_observations: int
    is_live_db: bool = True
    inflation_comparison_series: list[InflationComparisonPoint] = []
    cpi_inflation_combined_series: list[CPIInflationCombinedPoint] = []
    yoy_inflation_series: list[YoYInflationPoint] = []

