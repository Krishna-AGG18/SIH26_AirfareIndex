import type { IndexSeriesResponse } from "@/types/airfare";

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
