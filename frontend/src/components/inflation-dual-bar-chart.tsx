"use client";

import ReactECharts from "echarts-for-react";
import type { InflationComparisonPoint } from "@/types/airfare";

type InflationDualBarChartProps = {
  points: InflationComparisonPoint[];
  height?: number;
};

export function InflationDualBarChart({ points, height = 240 }: InflationDualBarChartProps) {
  const option = {
    backgroundColor: "transparent",
    animationDuration: 600,
    grid: { top: 40, right: 20, bottom: 40, left: 45 },
    legend: {
      data: ["Airfare Consumer Index", "General Index (All Groups)"],
      textStyle: { color: "#94a3b8", fontSize: 11 },
      bottom: 0,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(15, 23, 42, 0.92)",
      borderColor: "#334155",
      borderWidth: 1,
      textStyle: { color: "#f8fafc", fontSize: 12 },
      formatter: (params: Array<{ seriesName: string; value: number; name: string }>) => {
        if (!params || params.length === 0) return "";
        let res = `<strong>${params[0].name}</strong><br/>`;
        params.forEach((item) => {
          res += `${item.seriesName}: <strong>${item.value.toFixed(2)}%</strong><br/>`;
        });
        return res;
      },
    },
    xAxis: {
      type: "category",
      data: points.map((p) => p.month),
      axisLine: { lineStyle: { color: "#334155" } },
      axisTick: { show: false },
      axisLabel: { color: "#94a3b8", fontSize: 11, fontWeight: 500 },
    },
    yAxis: {
      type: "value",
      name: "Inflation Rate (%)",
      nameTextStyle: { color: "#64748b", fontSize: 10 },
      splitLine: { lineStyle: { color: "#1e293b", type: "dashed" } },
      axisLabel: { color: "#64748b", fontSize: 10, formatter: "{value}%" },
    },
    series: [
      {
        name: "Airfare Consumer Index",
        type: "bar",
        barGap: "20%",
        data: points.map((p) => p.airfare_inflation),
        itemStyle: {
          color: "#38bdf8",
          borderRadius: [2, 2, 0, 0],
        },
        label: {
          show: true,
          position: "top",
          color: "#38bdf8",
          fontSize: 9,
          fontWeight: 600,
          formatter: (params: { value: number }) => params.value.toFixed(2),
        },
      },
      {
        name: "General Index (All Groups)",
        type: "bar",
        data: points.map((p) => p.general_inflation),
        itemStyle: {
          color: "#64748b",
          borderRadius: [2, 2, 0, 0],
        },
        label: {
          show: true,
          position: "top",
          color: "#cbd5e1",
          fontSize: 9,
          fontWeight: 600,
          formatter: (params: { value: number }) => params.value.toFixed(2),
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: "100%" }} notMerge />;
}
