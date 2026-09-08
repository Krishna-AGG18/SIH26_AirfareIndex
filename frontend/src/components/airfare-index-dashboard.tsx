"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, Database, Radio, RefreshCw } from "lucide-react";
import { fetchIndexSeries } from "@/lib/api";
import { previewSeries } from "@/lib/mock-data";
import type { IndexSeriesResponse } from "@/types/airfare";
import { IndexChart } from "@/components/index-chart";
import { StatCard } from "@/components/stat-card";

const previewResponse: IndexSeriesResponse = {
  route: { origin: "DEL", destination: "BOM" },
  points: previewSeries,
};

export function AirfareIndexDashboard() {
  const [data, setData] = useState<IndexSeriesResponse>(previewResponse);
  const [isPreview, setIsPreview] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function loadSeries() {
    setIsRefreshing(true);
    try {
      const response = await fetchIndexSeries();
      setData(response);
      setIsPreview(false);
    } catch {
      setIsPreview(true);
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadSeries();
  }, []);

  const latest = data.points.at(-1) ?? previewSeries.at(-1)!;
  const previous = data.points.at(-2) ?? latest;
  const change = latest.index - previous.index;
  const totalObservations = useMemo(
    () => data.points.reduce((total, point) => total + point.observations, 0),
    [data.points],
  );

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">AX</span>
          <div>
            <p className="brand-name">Airfare APIx</p>
            <p className="brand-caption">India · Real-time index prototype</p>
          </div>
        </div>
        <div className="topbar-meta">
          <span className={`status-pill ${isPreview ? "status-pill--preview" : ""}`}>
            <span className="status-dot" />
            {isPreview ? "preview data" : "live feed"}
          </span>
          <button className="icon-button" type="button" onClick={() => void loadSeries()} aria-label="Refresh index">
            <RefreshCw size={16} className={isRefreshing ? "spin" : ""} />
          </button>
        </div>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow eyebrow--lime">MoSPI · SIH26056</p>
          <h1>See how the cost of flying is moving.</h1>
          <p className="hero-description">
            A transparent, route-level pulse on domestic airfares. Built for fast signals today and a richer collector network tomorrow.
          </p>
          <div className="route-selector" aria-label="Selected route">
            <span className="route-code">DEL</span>
            <ArrowUpRight size={17} />
            <span className="route-code">BOM</span>
            <span className="route-name">New Delhi → Mumbai</span>
          </div>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit-ring orbit-ring--outer" />
          <div className="orbit-ring orbit-ring--inner" />
          <div className="orbit-core"><Activity size={25} /></div>
          <span className="orbit-label orbit-label--one">LIVE</span>
          <span className="orbit-label orbit-label--two">INR</span>
        </div>
      </section>

      <section className="stats-grid" aria-label="Index summary">
        <StatCard label="Current index" value={latest.index.toFixed(1)} detail={`${change >= 0 ? "+" : ""}${change.toFixed(1)} pts from previous day`} />
        <StatCard label="Average fare" value={`₹${latest.averageFareInr.toLocaleString("en-IN")}`} detail="Economy · one-way equivalent" tone="amber" />
        <StatCard label="Collected signals" value={totalObservations.toLocaleString("en-IN")} detail="Normalized itinerary observations" tone="blue" />
      </section>

      <section className="content-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Route movement</p>
              <h2>Airfare index</h2>
            </div>
            <span className="panel-period">Last 12 days</span>
          </div>
          <IndexChart points={data.points} />
          <div className="chart-footer">
            <span><span className="legend-line" /> Rebased to 100 at first observation</span>
            <span>{isPreview ? "API connection pending" : "Updated just now"}</span>
          </div>
        </article>

        <aside className="panel signal-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">System signal</p>
              <h2>Collection health</h2>
            </div>
            <Radio size={19} className="panel-icon" />
          </div>
          <div className="health-value"><span>●</span> Nominal</div>
          <p className="signal-copy">The prototype is ready to receive SerpApi observations. Scraper fallback slots into the same normalized contract.</p>
          <div className="signal-list">
            <div><Database size={16} /><span>Neon Postgres</span><strong>configured</strong></div>
            <div><Activity size={16} /><span>SerpApi adapter</span><strong>prototype</strong></div>
            <div><Radio size={16} /><span>Source provenance</span><strong>enabled</strong></div>
          </div>
        </aside>
      </section>

      {isPreview && <p className="disclosure"><span>Preview mode</span> The API is not returning a stored series yet, so the dashboard is showing clearly labelled sample movement.</p>}
    </main>
  );
}
