"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TotalLikeAndAttendee } from "@/types/organizer.type";

const chartConfig = {
  totalAttendees: { label: "Attendee", color: "var(--accent-color)" },
  totalLikes: { label: "Like", color: "var(--main-color)" },
} satisfies ChartConfig;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatMonth(value: string) {
  const m = Number(value.split("-")[1]);
  return MONTHS[m - 1] ?? value;
}

interface Props {
  data: TotalLikeAndAttendee[];
}

export default function AttendanceChart({ data }: Props) {
  return (
      <ChartContainer config={chartConfig} className="w-full h-[320px]">
        <AreaChart accessibilityLayer data={data} margin={{ top: 10, left: -20, right: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="shadcnAttendee" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="shadcnLike" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--main-color)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--main-color)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="var(--input-border)" strokeDasharray="3 3" />

          <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={formatMonth}
              style={{ fill: "var(--text-desc)", fontSize: 12 }}
          />

          <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              style={{ fill: "var(--text-desc)", fontSize: 12 }}
          />

          <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                    className="bg-white rounded-xl card-shadow border-[var(--input-border)] font-sans"
                    indicator="dot"
                />
              }
          />

          <Area dataKey="totalLikes" type="monotone" stroke="var(--main-color)" strokeWidth={3} fillOpacity={1} fill="url(#shadcnLike)" stackId="a" />
          <Area dataKey="totalAttendees" type="monotone" stroke="var(--accent-color)" strokeWidth={3} fillOpacity={1} fill="url(#shadcnAttendee)" stackId="b" />
        </AreaChart>
      </ChartContainer>
  );
}