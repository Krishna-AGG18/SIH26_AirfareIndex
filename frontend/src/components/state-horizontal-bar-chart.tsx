"use client";

import ReactECharts from "echarts-for-react";
import type { CPIChartPoint } from "@/types/airfare";

type StateHorizontalBarChartProps = {
  points: CPIChartPoint[];
  color?: string;
  height?: number;
};

export function StateHorizontalBarChart({
  points,
  color = "#c4a57b",
  height = 360,
}: StateHorizontalBarChartProps) {
  const option = {
    backgroundColor: "transparent",
    animationDuration: 600,
    grid: { top: 20, right: 65, bottom: 25, left: 50 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(15, 23, 42, 0.92)",
      borderColor: "#334155",
      textStyle: { color: "#f8fafc", fontSize: 12 },
      formatter: (items: Array<{ dataIndex: number }>) => {
        const pt = points[items[0]?.dataIndex ?? 0];
        if (!pt) return "";
        return `<strong>${pt.label}</strong><br/>State Index: <strong>${pt.index.toFixed(2)}</strong><br/>Avg Fare: ₹${pt.average_fare_inr.toLocaleString("en-IN")}`;
      },
    },
    xAxis: {
      type: "value",
      scale: true,
      min: (value: { min: number }) => Math.max(0, Math.floor(value.min - 10)),
      splitLine: { lineStyle: { color: "#1e293b", type: "dashed" } },
      axisLabel: { color: "#64748b", fontSize: 10 },
    },
    yAxis: {
      type: "category",
      data: points.map((p) => p.label),
      inverse: false,
      axisLine: { lineStyle: { color: "#334155" } },
      axisTick: { show: false },
      axisLabel: { color: "#94a3b8", fontSize: 11, fontWeight: 500 },
    },
    series: [
      {
        name: "CPI",
        type: "bar",
        barWidth: "45%",
        data: points.map((p) => p.index),
        itemStyle: {
          color: color,
          borderRadius: [0, 3, 3, 0],
        },
        label: {
          show: true,
          position: "right",
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
