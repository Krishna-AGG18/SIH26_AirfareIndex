export type ObservationSource = "live" | "synthetic";

export type AirfareIndexPoint = {
  date: string;
  index: number;
  averageFareInr: number;
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
  points: AirfareIndexPoint[];
};
