import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AirfareIndexDashboard } from "../airfare-index-dashboard";

vi.mock("echarts-for-react", () => ({
  default: () => <div data-testid="echarts-mock" />,
}));

vi.mock("@/lib/api", () => ({
  fetchCPIDashboard: vi.fn().mockResolvedValue({
    schedule: "next_month",
    base_year: "2024",
    selected_state: "Arunachal Pradesh",
    selected_sector: "rural",
    rural_series: [{ label: "July", date: "2026-07-01", index: 108.34, average_fare_inr: 4500, observations: 10 }],
    urban_series: [{ label: "July", date: "2026-07-01", index: 107.45, average_fare_inr: 5200, observations: 12 }],
    combined_series: [{ label: "July", date: "2026-07-01", index: 107.94, average_fare_inr: 4850, observations: 22 }],
    state_series: [{ label: "July", date: "2026-07-01", index: 105.13, average_fare_inr: 4200, observations: 5 }],
    states_summary: [],
    available_states: ["Arunachal Pradesh", "Delhi", "Maharashtra"],
    total_observations: 49,
    is_live_db: true,
  }),
  triggerSeedData: vi.fn().mockResolvedValue({ message: "Seeded", count: 10 }),
}));

describe("AirfareIndexDashboard", () => {
  it("renders MoSPI CPI header and schedule dropdown", async () => {
    render(<AirfareIndexDashboard />);
    expect(screen.getAllByText(/Consumer Price Index \(CPI\)/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Schedule Horizon/i)).toBeInTheDocument();
    expect(screen.getByText(/All India Consumer Price Index \(CPI\) - Rural/i)).toBeInTheDocument();
    expect(screen.getByText(/All India Consumer Price Index \(CPI\) - Urban/i)).toBeInTheDocument();
    expect(screen.getByText(/State Wise Consumer Price Index/i)).toBeInTheDocument();
  });
});
