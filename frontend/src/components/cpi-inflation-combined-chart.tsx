"use client";

import ReactECharts from "echarts-for-react";
import type { CPIInflationCombinedPoint } from "@/types/airfare";

type CPIInflationCombinedChartProps = {
  points: CPIInflationCombinedPoint[];
  height?: number;
};

export function CPIInflationCombinedChart({ points, height = 240 }: CPIInflationCombinedChartProps) {
  const option = {
    backgroundColor: "transparent",
    animationDuration: 600,
    grid: { top: 35, right: 45, bottom: 35, left: 45 },
    legend: {
      data: ["CPI Index", "Inflation Rate(%)"],
      textStyle: { color: "#94a3b8", fontSize: 11 },
      bottom: 0,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(15, 23, 42, 0.92)",
      borderColor: "#334155",
      borderWidth: 1,
      textStyle: { color: "#f8fafc", fontSize: 12 },
      formatter: (params: Array<{ seriesName: string; value: number; name: string }>) => {
        if (!params || params.length === 0) return "";
        let res = `<strong>${params[0].name}</strong><br/>`;
        params.forEach((item) => {
          const unit = item.seriesName.includes("Inflation") ? "%" : "";
          res += `${item.seriesName}: <strong>${item.value}${unit}</strong><br/>`;
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
    yAxis: [
      {
        type: "value",
        name: "CPI Index",
        scale: true,
        nameTextStyle: { color: "#c4a57b", fontSize: 10 },
        splitLine: { lineStyle: { color: "#1e293b", type: "dashed" } },
        axisLabel: { color: "#c4a57b", fontSize: 10 },
      },
      {
        type: "value",
        name: "Inflation Rate (%)",
        scale: true,
        nameTextStyle: { color: "#38bdf8", fontSize: 10 },
        splitLine: { show: false },
        axisLabel: { color: "#38bdf8", fontSize: 10, formatter: "{value}%" },
      },
    ],
    series: [
      {
        name: "CPI Index",
        type: "bar",
        yAxisIndex: 0,
        barWidth: "40%",
        data: points.map((p) => p.cpi_index),
        itemStyle: {
          color: "#c4a57b",
          borderRadius: [3, 3, 0, 0],
        },
        label: {
          show: true,
          position: "top",
          color: "#f8fafc",
          fontSize: 9,
          fontWeight: 600,
          formatter: (params: { value: number }) => params.value.toFixed(1),
        },
      },
      {
        name: "Inflation Rate(%)",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        data: points.map((p) => p.inflation_rate),
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: "#38bdf8", width: 2.5 },
        itemStyle: { color: "#38bdf8" },
        label: {
          show: true,
          position: "bottom",
          color: "#38bdf8",
          fontSize: 9,
          fontWeight: 600,
          formatter: (params: { value: number }) => `${params.value.toFixed(2)}%`,
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: "100%" }} notMerge />;
}
