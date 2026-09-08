"use client";

import ReactECharts from "echarts-for-react";
import type { AirfareIndexPoint } from "@/types/airfare";

type IndexChartProps = {
  points: AirfareIndexPoint[];
};

export function IndexChart({ points }: IndexChartProps) {
  const option = {
    animationDuration: 700,
    grid: { top: 22, right: 22, bottom: 32, left: 48 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#17211d",
      borderColor: "#2f4439",
      textStyle: { color: "#f0f3eb" },
      formatter: (items: Array<{ dataIndex: number }>) => {
        const point = points[items[0]?.dataIndex ?? 0];
        const fare = point.averageFareInr === null
          ? "CPI benchmark"
          : `₹${point.averageFareInr.toLocaleString("en-IN")}`;
        return `${point.date}<br/><strong>${point.index.toFixed(1)}</strong> index · ${fare}`;
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: points.map((point) => point.date.slice(5)),
      axisLine: { lineStyle: { color: "#304039" } },
      axisLabel: { color: "#91a198", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      scale: true,
      splitLine: { lineStyle: { color: "#24322c", type: "dashed" } },
      axisLabel: { color: "#91a198", fontSize: 11 },
    },
    series: [
      {
        name: "Airfare index",
        type: "line",
        smooth: 0.28,
        showSymbol: false,
        data: points.map((point) => point.index),
        lineStyle: { color: "#b6e36b", width: 3 },
        itemStyle: { color: "#b6e36b" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(182, 227, 107, 0.28)" },
              { offset: 1, color: "rgba(182, 227, 107, 0)" },
            ],
          },
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 330, width: "100%" }} notMerge />;
}
