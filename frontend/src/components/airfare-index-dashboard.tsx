"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Database, Layers, RefreshCw, Sparkles } from "lucide-react";
import { fetchCPIDashboard, triggerSeedData } from "@/lib/api";
import type { CPIChartPoint, CPIDashboardResponse, ScheduleOption, SectorOption } from "@/types/airfare";
import { CPIBarChart } from "@/components/cpi-bar-chart";
import { StateHorizontalBarChart } from "@/components/state-horizontal-bar-chart";
import { InflationDualBarChart } from "@/components/inflation-dual-bar-chart";
import { CPIInflationCombinedChart } from "@/components/cpi-inflation-combined-chart";
import { InflationAreaLineChart } from "@/components/inflation-area-line-chart";

export function AirfareIndexDashboard() {
  // Global dashboard controls
  const [schedule, setSchedule] = useState<ScheduleOption>("next_month");
  const baseYear = "2024";
  const [selectedYear, setSelectedYear] = useState<string>("2026");

  // Isolated Card 4 (State Wise CPI) controls & state
  const [selectedState, setSelectedState] = useState<string>("Arunachal Pradesh");
  const [selectedStateSector, setSelectedStateSector] = useState<SectorOption>("rural");
  const [stateSeriesData, setStateSeriesData] = useState<CPIChartPoint[] | null>(null);
  const [isStateLoading, setIsStateLoading] = useState<boolean>(false);

  // Isolated Card 5 (Inflation Dual Bar) sector toggle
  const [dualBarSector, setDualBarSector] = useState<SectorOption>("rural");

  // Isolated Card 7 (YoY Inflation) sector toggle
  const [yoySector, setYoySector] = useState<SectorOption>("urban");

  // Global data & loading states
  const [dashboardData, setDashboardData] = useState<CPIDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const stateRef = useRef({ state: selectedState, sector: selectedStateSector });
  stateRef.current = { state: selectedState, sector: selectedStateSector };

  const loadGlobalDashboard = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      const data = await fetchCPIDashboard({
        schedule,
        baseYear,
        year: selectedYear,
        state: stateRef.current.state,
        sector: stateRef.current.sector,
      });
      setDashboardData(data);
      setStateSeriesData(data.state_series);
      if (data.available_states?.length > 0 && !data.available_states.includes(stateRef.current.state)) {
        setSelectedState(data.available_states[0]);
      }
    } catch (err) {
      console.error("Failed to load CPI dashboard data from DB:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to load database records");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [schedule, baseYear, selectedYear]);

  useEffect(() => {
    void loadGlobalDashboard(true);
  }, [loadGlobalDashboard]);

  // Card 4 only state change handler
  const handleStateFilterChange = async (newState: string, newSector: SectorOption) => {
    setSelectedState(newState);
    setSelectedStateSector(newSector);
    setIsStateLoading(true);
    try {
      const data = await fetchCPIDashboard({
        schedule,
        baseYear,
        year: selectedYear,
        state: newState,
        sector: newSector,
      });
      setStateSeriesData(data.state_series);
    } catch (err) {
      console.error("Failed to update state series:", err);
    } finally {
      setIsStateLoading(false);
    }
  };

  async function handleSeed() {
    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      const res = await triggerSeedData();
      setSeedMessage(res.message);
      await loadGlobalDashboard(false);
      setTimeout(() => setSeedMessage(null), 4000);
    } catch (err) {
      console.error("Seed error:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to re-seed database");
    } finally {
      setIsRefreshing(false);
    }
  }

  const availableStates = dashboardData?.available_states ?? [];

  // Sector-specific inflation comparison data for Card 5
  const dualBarPoints =
    dashboardData?.inflation_comparison_by_sector?.[dualBarSector] ??
    dashboardData?.inflation_comparison_series ??
    [];

  // Sector-specific YoY inflation data for Card 7
  const yoyPoints =
    dashboardData?.yoy_series_by_sector?.[yoySector] ??
    dashboardData?.yoy_inflation_series ??
    [];

  const currentStateSeries = stateSeriesData ?? dashboardData?.state_series ?? [];

  return (
    <div className="mospi-container">
      {/* Top Portal Header */}
      <header className="portal-header">
        <div className="header-left">
          <div className="gov-emblem">
            <span className="emblem-text">PRICEX</span>
          </div>
          <div className="header-title-block">
            <h1 className="gov-title">AIRFARE PRICEX</h1>
            <p className="gov-subtitle">INDIA&apos;S DIGITAL AIRFARE INFLATION MONITOR</p>
          </div>
        </div>
      </header>

      {/* Main Dashboard Canvas */}
      <main className="dashboard-canvas">
        {/* Tab Subheader */}
        <div className="tab-subheader">
          <button type="button" className="subtab-btn active">
            <Layers size={14} /> Chart
          </button>
        </div>

        {/* Dashboard Frame */}
        <div className="dashboard-frame">
          {/* Controls Bar */}
          <div className="controls-row">
            <div className="cpi-title-section">
              <h2>Consumer Price Index (CPI)</h2>
              <div className="base-year-group">
                <span className="base-badge">
                  Base Year 2024
                </span>
              </div>
            </div>

            <div className="center-banner">
              <span className="cpi-pill-badge">Consumer Price Index</span>
            </div>

            <div className="controls-right">
              {/* Year Dropdown */}
              <div className="select-group">
                <label htmlFor="year-select">Year</label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="mospi-select"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>

              {/* Schedule Dropdown (Today, Next Week, Next Month, Next 45 Days) */}
              <div className="select-group highlight-select">
                <label htmlFor="schedule-select">Schedule Horizon</label>
                <select
                  id="schedule-select"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value as ScheduleOption)}
                  className="mospi-select schedule-dropdown"
                >
                  <option value="today">Today</option>
                  <option value="next_week">Next Week</option>
                  <option value="next_month">Next Month</option>
                  <option value="next_45_days">Next 45 Days Schedule</option>
                </select>
              </div>

              {/* Refresh / Status */}
              <button
                type="button"
                className="icon-action-btn"
                onClick={() => void loadGlobalDashboard(true)}
                title="Refresh Live Data"
              >
                <RefreshCw size={15} className={isRefreshing ? "spin" : ""} />
              </button>
            </div>
          </div>

          {/* Seed Notification Toast */}
          {seedMessage && (
            <div className="toast-notification">
              <Sparkles size={16} /> {seedMessage}
            </div>
          )}

          {/* Error Notification Toast */}
          {errorMessage && (
            <div className="toast-notification" style={{ borderColor: "#ef4444", color: "#fca5a5", background: "rgba(239, 68, 68, 0.15)" }}>
              <span>⚠️ {errorMessage}</span>
              <button
                type="button"
                onClick={() => void loadGlobalDashboard(true)}
                style={{ marginLeft: 12, background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, padding: "3px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Grid Layout (CPI Cards & Inflation Rate Cards) */}
          <div className="dashboard-grid">
            {/* 1. Rural Visualisation Panel */}
            <div className="chart-card rural-card">
              <div className="card-header">
                <h3>All India Consumer Price Index (CPI) - Rural</h3>
                <span className="tag-badge rural-tag">Rural Sector</span>
              </div>
              <div className="card-body">
                {isLoading || !dashboardData ? (
                  <div className="chart-skeleton"><RefreshCw className="spin" size={24} /> Loading DB Data...</div>
                ) : (
                  <CPIBarChart points={dashboardData.rural_series} color="#38bdf8" height={210} />
                )}
              </div>
            </div>

            {/* 2. Urban Visualisation Panel */}
            <div className="chart-card urban-card">
              <div className="card-header">
                <h3>All India Consumer Price Index (CPI) - Urban</h3>
                <span className="tag-badge urban-tag">Urban Sector</span>
              </div>
              <div className="card-body">
                {isLoading || !dashboardData ? (
                  <div className="chart-skeleton"><RefreshCw className="spin" size={24} /> Loading DB Data...</div>
                ) : (
                  <CPIBarChart points={dashboardData.urban_series} color="#60a5fa" height={210} />
                )}
              </div>
            </div>

            {/* 3. Combined Visualisation Panel */}
            <div className="chart-card combined-card">
              <div className="card-header">
                <h3>All India Consumer Price Index (CPI) - Combined</h3>
                <span className="tag-badge combined-tag">Combined</span>
              </div>
              <div className="card-body">
                {isLoading || !dashboardData ? (
                  <div className="chart-skeleton"><RefreshCw className="spin" size={24} /> Loading DB Data...</div>
                ) : (
                  <CPIBarChart points={dashboardData.combined_series} color="#94a3b8" height={210} />
                )}
              </div>
            </div>

            {/* 4. State Wise Categorisation Panel */}
            <div className="chart-card state-card">
              <div className="card-header state-header">
                <h3>State Wise Consumer Price Index</h3>
                <div className="state-controls-row">
                  {/* Select State */}
                  <div className="mini-select-group">
                    <label htmlFor="state-select">States</label>
                    <select
                      id="state-select"
                      value={selectedState}
                      onChange={(e) => void handleStateFilterChange(e.target.value, selectedStateSector)}
                      className="mospi-select mini-select"
                    >
                      {availableStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Sector */}
                  <div className="mini-select-group">
                    <label htmlFor="sector-select">Select the Sector</label>
                    <select
                      id="sector-select"
                      value={selectedStateSector}
                      onChange={(e) => void handleStateFilterChange(selectedState, e.target.value as SectorOption)}
                      className="mospi-select mini-select"
                    >
                      <option value="rural">Rural</option>
                      <option value="urban">Urban</option>
                      <option value="combined">Combined</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card-body">
                {isLoading || isStateLoading || !dashboardData ? (
                  <div className="chart-skeleton"><RefreshCw className="spin" size={24} /> Loading DB Data...</div>
                ) : (
                  <StateHorizontalBarChart points={currentStateSeries} color="#c4a57b" height={360} />
                )}
              </div>
            </div>

            {/* 5. Rate of Inflation (%) based on All India CPI & Airfare CPI (Dual Bar) */}
            <div className="chart-card half-card">
              <div className="card-header">
                <h3>Rate of Inflation(%) based on All India Consumer Price Index (CPI) and Airfare CPI</h3>
                <div className="sector-toggle-buttons">
                  <button
                    type="button"
                    className={`sector-btn ${dualBarSector === "rural" ? "active" : ""}`}
                    onClick={() => setDualBarSector("rural")}
                  >
                    Rural
                  </button>
                  <button
                    type="button"
                    className={`sector-btn ${dualBarSector === "urban" ? "active" : ""}`}
                    onClick={() => setDualBarSector("urban")}
                  >
                    Urban
                  </button>
                  <button
                    type="button"
                    className={`sector-btn ${dualBarSector === "combined" ? "active" : ""}`}
                    onClick={() => setDualBarSector("combined")}
                  >
                    Combined
                  </button>
                </div>
              </div>
              <div className="card-body">
                {isLoading || !dashboardData ? (
                  <div className="chart-skeleton"><RefreshCw className="spin" size={24} /> Loading DB Data...</div>
                ) : (
                  <InflationDualBarChart points={dualBarPoints} height={250} />
                )}
              </div>
            </div>

            {/* 6. CPI & Inflation Rate(%) (Combined Bar + Line) */}
            <div className="chart-card half-card">
              <div className="card-header">
                <h3>CPI & Inflation Rate(%)</h3>
                <span className="tag-badge combined-tag">CPI vs Inflation %</span>
              </div>
              <div className="card-body">
                {isLoading || !dashboardData ? (
                  <div className="chart-skeleton"><RefreshCw className="spin" size={24} /> Loading DB Data...</div>
                ) : (
                  <CPIInflationCombinedChart points={dashboardData.cpi_inflation_combined_series ?? []} height={250} />
                )}
              </div>
            </div>

            {/* 7. All-India YoY Inflation Rate(%) (Area Line Chart) */}
            <div className="chart-card state-card">
              <div className="card-header">
                <h3>All-India YoY Inflation Rate(%)</h3>
                <div className="sector-toggle-buttons">
                  <button
                    type="button"
                    className={`sector-btn ${yoySector === "rural" ? "active" : ""}`}
                    onClick={() => setYoySector("rural")}
                  >
                    Rural
                  </button>
                  <button
                    type="button"
                    className={`sector-btn ${yoySector === "urban" ? "active" : ""}`}
                    onClick={() => setYoySector("urban")}
                  >
                    Urban
                  </button>
                  <button
                    type="button"
                    className={`sector-btn ${yoySector === "combined" ? "active" : ""}`}
                    onClick={() => setYoySector("combined")}
                  >
                    Combined
                  </button>
                </div>
              </div>
              <div className="card-body">
                {isLoading || !dashboardData ? (
                  <div className="chart-skeleton"><RefreshCw className="spin" size={24} /> Loading DB Data...</div>
                ) : (
                  <InflationAreaLineChart points={yoyPoints} height={250} />
                )}
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <footer className="powerbi-footer" style={{ justifyContent: "center" }}>
            <div className="footer-center">
              <span className="page-nav">&lt; 3 of 3 &gt;</span>
              <button
                type="button"
                className="seed-db-btn"
                onClick={() => void handleSeed()}
                title="Seed Database Records"
              >
                <Database size={13} /> Re-seed DB
              </button>
              <span className="live-db-pill">
                <span className="dot-green" /> DB Live ({dashboardData?.total_observations ?? 0} obs)
              </span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
