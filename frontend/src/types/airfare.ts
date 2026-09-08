export type ObservationSource = "live" | "synthetic";

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
