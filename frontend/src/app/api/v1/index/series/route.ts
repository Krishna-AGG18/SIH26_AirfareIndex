import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { AirfareIndexPoint, IndexSeriesResponse } from "@/types/airfare";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = (searchParams.get("origin") || "DEL").toUpperCase();
    const destination = (searchParams.get("destination") || "BOM").toUpperCase();
    const state = searchParams.get("state") || "All India";
    const sector = searchParams.get("sector") || "Combined";

    const sql = getDb();

    // 1. First attempt to query live fare observations for the route
    const liveRows = (await sql.query(
      `SELECT outbound_date::text AS date, AVG(fare_inr)::numeric AS avg_fare, COUNT(*)::int AS obs_count
       FROM fare_observations
       WHERE UPPER(origin) = $1 AND UPPER(destination) = $2
       GROUP BY outbound_date
       ORDER BY outbound_date ASC`,
      [origin, destination]
    )) as Array<{ date: string; avg_fare: string | number; obs_count: number }>;

    if (liveRows.length > 0) {
      const baseFare = parseFloat(String(liveRows[0].avg_fare));
      const points: AirfareIndexPoint[] = liveRows.map((r) => {
        const avg = parseFloat(String(r.avg_fare));
        const indexVal = baseFare > 0 ? parseFloat(((avg / baseFare) * 100).toFixed(2)) : 100.0;
        return {
          date: r.date,
          index: indexVal,
          averageFareInr: avg,
          observations: r.obs_count,
        };
      });

      const response: IndexSeriesResponse = {
        route: { origin, destination },
        source: "live",
        sourceLabel: "Live fare observations",
        points,
      };
      return NextResponse.json(response);
    }

    // 2. Query airfare index observations (MoSPI benchmark)
    const synthRows = (await sql.query(
      `SELECT observation_month::text AS date, index_value
       FROM airfare_index_observations
       WHERE state ILIKE $1 AND sector ILIKE $2
       ORDER BY observation_month ASC`,
      [state, sector]
    )) as Array<{ date: string; index_value: string | number | null }>;

    const points: AirfareIndexPoint[] = synthRows.map((r) => {
      const idx = r.index_value !== null ? parseFloat(String(r.index_value)) : 100.0;
      return {
        date: r.date,
        index: idx,
        averageFareInr: parseFloat((idx * 42.5).toFixed(2)),
        observations: 1,
      };
    });

    const response: IndexSeriesResponse = {
      route: { origin, destination },
      source: "synthetic",
      sourceLabel: `MoSPI CPI Airfare Index · ${state} / ${sector}`,
      fallbackUsed: true,
      points,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in /api/v1/index/series:", error);
    return NextResponse.json(
      { error: "Failed to fetch index series", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
