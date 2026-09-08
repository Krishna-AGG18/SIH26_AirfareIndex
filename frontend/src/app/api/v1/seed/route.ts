import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const INDIAN_STATES = [
  { name: "Arunachal Pradesh", rural_hub: "TEZ", urban_hub: "IXT", base_rural_fare: 4200, base_urban_fare: 6500 },
  { name: "Assam", rural_hub: "RUP", urban_hub: "GAU", base_rural_fare: 3800, base_urban_fare: 5400 },
  { name: "Bihar", rural_hub: "DBR", urban_hub: "PAT", base_rural_fare: 3500, base_urban_fare: 4900 },
  { name: "Delhi", rural_hub: "DEL", urban_hub: "DEL", base_rural_fare: 4800, base_urban_fare: 5200 },
  { name: "Gujarat", rural_hub: "PBD", urban_hub: "AMD", base_rural_fare: 3600, base_urban_fare: 4800 },
  { name: "Karnataka", rural_hub: "IXG", urban_hub: "BLR", base_rural_fare: 4100, base_urban_fare: 5600 },
  { name: "Kerala", rural_hub: "CNN", urban_hub: "COK", base_rural_fare: 3900, base_urban_fare: 5100 },
  { name: "Maharashtra", rural_hub: "NDC", urban_hub: "BOM", base_rural_fare: 4300, base_urban_fare: 6100 },
  { name: "Punjab", rural_hub: "AIP", urban_hub: "ATQ", base_rural_fare: 3700, base_urban_fare: 5300 },
  { name: "Rajasthan", rural_hub: "UDR", urban_hub: "JAI", base_rural_fare: 3400, base_urban_fare: 4700 },
  { name: "Tamil Nadu", rural_hub: "TCR", urban_hub: "MAA", base_rural_fare: 3800, base_urban_fare: 5200 },
  { name: "Uttar Pradesh", rural_hub: "KUU", urban_hub: "LKO", base_rural_fare: 3300, base_urban_fare: 4600 },
  { name: "West Bengal", rural_hub: "RGD", urban_hub: "CCU", base_rural_fare: 3700, base_urban_fare: 5500 },
];

const AIRLINES = [
  { name: "IndiGo", prefix: "6E" },
  { name: "Air India", prefix: "AI" },
  { name: "Akasa Air", prefix: "QP" },
  { name: "Alliance Air", prefix: "9I" },
  { name: "SpiceJet", prefix: "SG" },
];

export async function POST() {
  try {
    const sql = getDb();
    const today = new Date();
    let insertCount = 0;

    for (const stateInfo of INDIAN_STATES) {
      for (let dayOffset = 0; dayOffset <= 45; dayOffset += 3) {
        const outDate = new Date(today);
        outDate.setDate(outDate.getDate() + dayOffset);
        const outDateStr = outDate.toISOString().split("T")[0];

        for (const sector of ["rural", "urban"]) {
          const hub = sector === "rural" ? stateInfo.rural_hub : stateInfo.urban_hub;
          const baseFare = sector === "rural" ? stateInfo.base_rural_fare : stateInfo.base_urban_fare;
          const leadFactor = 1.0 + 0.15 * Math.sin(dayOffset / 7.0) + 0.05 * (dayOffset / 10.0);

          const sampleCount = Math.floor(Math.random() * 3) + 2;
          for (let i = 0; i < sampleCount; i++) {
            const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
            const fare = parseFloat((baseFare * leadFactor * (0.92 + Math.random() * 0.16)).toFixed(2));
            const flightNum = `${airline.prefix}-${Math.floor(Math.random() * 900) + 100}`;
            const duration = Math.floor(Math.random() * 120) + 60;
            const stops = sector === "urban" ? 0 : Math.random() > 0.5 ? 1 : 0;
            const id = randomUUID();

            await sql.query(
              `INSERT INTO fare_observations (
                id, origin, destination, outbound_date, airline, flight_number,
                fare_inr, currency, duration_minutes, stops, source, state, sector, captured_at, raw_payload
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, 'INR', $8, $9, 'live', $10, $11, NOW(), $12
              )`,
              [
                id,
                hub,
                hub !== "DEL" ? "DEL" : "BOM",
                outDateStr,
                airline.name,
                flightNum,
                fare,
                duration,
                stops,
                stateInfo.name,
                sector,
                JSON.stringify({ seeded: true, state: stateInfo.name, sector }),
              ]
            );
            insertCount++;
          }
        }
      }
    }

    return NextResponse.json({
      message: `Successfully seeded ${insertCount} live observation records into database`,
      count: insertCount,
    });
  } catch (error) {
    console.error("Error seeding DB:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
