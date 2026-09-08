export type ObservationSource = "live" | "synthetic";
export type ScheduleOption = "today" | "next_week" | "next_month" | "next_45_days";
export type SectorOption = "rural" | "urban" | "combined";

export type AirfareIndexPoint = {
  date: string;
  index: number;
  averageFareInr: number | null;
  observations: number;
};

export type FareOffer = {
  id: string;
  source: ObservationSource;
  airline: string;
  flightNumber?: string;
  origin: string;
  destination: string;
  departureTime?: string;
  arrivalTime?: string;
  durationMinutes?: number;
  stops: number;
  fareInr: number;
  currency: "INR";
};

export type IndexSeriesResponse = {
  route: { origin: string; destination: string };
  source: ObservationSource;
  sourceLabel: string;
  fallbackUsed?: boolean;
  points: AirfareIndexPoint[];
};

export type MapeComparisonPoint = {
  month: string;
  observedIndex: number;
  benchmarkIndex: number;
  absolutePercentageError: number;
};

export type MapeResponse = {
  route: { origin: string; destination: string };
  benchmark: string;
  pointsCompared: number;
  mapePercent: number | null;
  points: MapeComparisonPoint[];
};

export type CPIChartPoint = {
  label: string;
  date: string;
  index: number;
  average_fare_inr: number;
  observations: number;
  inflation_yoy?: number;
  inflation_mom?: number;
};

export type StateSummary = {
  state: string;
  sector: string;
  cpi_index: number;
  average_fare_inr: number;
  observations: number;
};

export type InflationComparisonPoint = {
  month: string;
  airfare_inflation: number;
  general_inflation: number;
};

export type CPIInflationCombinedPoint = {
  month: string;
  cpi_index: number;
  inflation_rate: number;
};

export type YoYInflationPoint = {
  month: string;
  inflation_rate: number;
};

export type CPIDashboardResponse = {
  schedule: ScheduleOption;
  base_year: string;
  year?: number;
  selected_state: string;
  selected_sector: SectorOption;
  rural_series: CPIChartPoint[];
  urban_series: CPIChartPoint[];
  combined_series: CPIChartPoint[];
  state_series: CPIChartPoint[];
  states_summary: StateSummary[];
  available_states: string[];
  total_observations: number;
  is_live_db: boolean;
  inflation_comparison_series?: InflationComparisonPoint[];
  cpi_inflation_combined_series?: CPIInflationCombinedPoint[];
  yoy_inflation_series?: YoYInflationPoint[];
  yoy_series_by_sector?: {
    rural: YoYInflationPoint[];
    urban: YoYInflationPoint[];
    combined: YoYInflationPoint[];
  };
  inflation_comparison_by_sector?: {
    rural: InflationComparisonPoint[];
    urban: InflationComparisonPoint[];
    combined: InflationComparisonPoint[];
  };
};
