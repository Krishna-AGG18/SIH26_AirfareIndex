"use client";

import ReactECharts from "echarts-for-react";
import type { YoYInflationPoint } from "@/types/airfare";

type InflationAreaLineChartProps = {
  points: YoYInflationPoint[];
  height?: number;
};

export function InflationAreaLineChart({ points, height = 240 }: InflationAreaLineChartProps) {
  const option = {
    backgroundColor: "transparent",
    animationDuration: 600,
    grid: { top: 35, right: 25, bottom: 35, left: 45 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(15, 23, 42, 0.92)",
      borderColor: "#334155",
      borderWidth: 1,
      textStyle: { color: "#f8fafc", fontSize: 12 },
      formatter: (params: Array<{ name: string; value: number }>) => {
        if (!params || params.length === 0) return "";
        return `<strong>${params[0].name}</strong><br/>YoY Inflation: <strong>${params[0].value.toFixed(2)}%</strong>`;
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
        name: "YoY Inflation Rate",
        type: "line",
        smooth: true,
        data: points.map((p) => p.inflation_rate),
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: "#38bdf8", width: 2.5 },
        itemStyle: { color: "#38bdf8" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(56, 189, 248, 0.35)" },
              { offset: 1, color: "rgba(56, 189, 248, 0.02)" },
            ],
          },
        },
        label: {
          show: true,
          position: "top",
          color: "#f8fafc",
          fontSize: 9,
          fontWeight: 600,
          formatter: (params: { value: number }) => `${params.value.toFixed(2)}%`,
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: "100%" }} notMerge />;
}
