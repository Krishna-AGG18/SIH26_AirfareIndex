"use client";

import ReactECharts from "echarts-for-react";
import type { CPIChartPoint } from "@/types/airfare";

type CPIBarChartProps = {
  points: CPIChartPoint[];
  color: string;
  height?: number;
};

export function CPIBarChart({ points, color, height = 230 }: CPIBarChartProps) {
  const option = {
    backgroundColor: "transparent",
    animationDuration: 600,
    grid: { top: 32, right: 15, bottom: 25, left: 35 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(15, 23, 42, 0.92)",
      borderColor: "#334155",
      borderWidth: 1,
      textStyle: { color: "#f8fafc", fontSize: 12 },
      formatter: (items: Array<{ dataIndex: number }>) => {
        const pt = points[items[0]?.dataIndex ?? 0];
        if (!pt) return "";
        return `<strong>${pt.label}</strong><br/>CPI Index: <strong>${pt.index.toFixed(2)}</strong><br/>Avg Fare: ₹${pt.average_fare_inr.toLocaleString("en-IN")}<br/>Observations: ${pt.observations}`;
      },
    },
    xAxis: {
      type: "category",
      data: points.map((p) => p.label),
      axisLine: { lineStyle: { color: "#334155" } },
      axisTick: { show: false },
      axisLabel: { color: "#94a3b8", fontSize: 11, fontWeight: 500 },
    },
    yAxis: {
      type: "value",
      scale: true,
      min: (value: { min: number }) => Math.max(0, Math.floor(value.min - 5)),
      splitLine: { lineStyle: { color: "#1e293b", type: "dashed" } },
      axisLabel: { color: "#64748b", fontSize: 10 },
    },
    series: [
      {
        name: "CPI Index",
        type: "bar",
        barWidth: "40%",
        data: points.map((p) => p.index),
        itemStyle: {
          color: color,
          borderRadius: [3, 3, 0, 0],
        },
        label: {
          show: true,
          position: "top",
          color: "#f8fafc",
          fontSize: 10,
          fontWeight: 600,
          formatter: (params: { value: number }) => params.value.toFixed(2),
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: "100%" }} notMerge />;
}
