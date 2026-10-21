"use client";

import React, { useMemo } from "react";
import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ModeratorKPI } from "@/types/moderator.type";

const chartConfig = {
  value: { label: "Total Count" },
  organization: { label: "Organizations" },
  event: { label: "Events" },
  report: { label: "Reports" },
} satisfies ChartConfig;

export default function ChartPieDonut({
  totalOrg,
  totalReport,
  totalEvent,
}: ModeratorKPI) {
  const chartData = [
    { type: "organization", value: totalOrg, fill: "var(--main-color)" },
    { type: "event", value: totalEvent, fill: "var(--warning-color)" },
    { type: "report", value: totalReport, fill: "var(--accent-color)" },
  ];

  const totalCount = useMemo(
    () => totalOrg + totalReport + totalEvent,
    [totalOrg, totalReport, totalEvent],
  );

  return (
    <div className="flex px-10 justify-between items-center bg-white rounded-2xl box-shadow h-full w-full">
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-(--main-color) text-[20px] font-semibold mt-4 mb-4">
          Activity Overview
        </p>

        {[
          {
            label: "Total Organization",
            val: totalOrg,
            color: "var(--main-color)",
          },
          {
            label: "Total Event",
            val: totalEvent,
            color: "var(--warning-color)",
          },
          {
            label: "Total Report",
            val: totalReport,
            color: "var(--accent-color)",
          },
        ].map((item) => (
          <div key={item.label} className="mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              ></div>
              <p className="text-gray-400 font-medium text-sm">{item.label}</p>
            </div>
            <h2 className="font-bold text-lg text-slate-800 pl-6.5">
              {item.val}
            </h2>
          </div>
        ))}
      </div>

      <div className="relative flex items-center justify-center shrink-0">
        <ChartContainer config={chartConfig} className="aspect-square w-60">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="type"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              cornerRadius={8}
            />
          </PieChart>
        </ChartContainer>
        {/* Central Label */}
        <div className="absolute flex flex-col items-center">
          <span className="text-gray-400 text-xs font-medium">Total</span>
          <span className="text-2xl font-bold text-slate-800">
            {totalCount}
          </span>
        </div>
      </div>
    </div>
  );
}
