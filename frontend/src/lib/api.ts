import type { CPIDashboardResponse, IndexSeriesResponse, ScheduleOption, SectorOption } from "@/types/airfare";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function fetchIndexSeries(signal?: AbortSignal): Promise<IndexSeriesResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/index/series`, {
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Index API returned ${response.status}`);
  }

  return response.json() as Promise<IndexSeriesResponse>;
}

export async function fetchCPIDashboard(
  params: {
    schedule?: ScheduleOption;
    baseYear?: string;
    year?: string;
    state?: string;
    sector?: SectorOption;
  } = {},
  signal?: AbortSignal
): Promise<CPIDashboardResponse> {
  const query = new URLSearchParams();
  if (params.schedule) query.set("schedule", params.schedule);
  if (params.baseYear) query.set("base_year", params.baseYear);
  if (params.year) query.set("year", params.year);
  if (params.state) query.set("state", params.state);
  if (params.sector) query.set("sector", params.sector);

  const response = await fetch(`${apiBaseUrl}/api/v1/dashboard/cpi?${query.toString()}`, {
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`CPI Dashboard API returned ${response.status}`);
  }

  return response.json() as Promise<CPIDashboardResponse>;
}

export async function triggerSeedData(): Promise<{ message: string; count: number }> {
  const response = await fetch(`${apiBaseUrl}/api/v1/seed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Seed API returned ${response.status}`);
  }

  return response.json() as Promise<{ message: string; count: number }>;
}
