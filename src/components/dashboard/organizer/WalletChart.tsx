"use client";

import React from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TotalEarningsPerMonth } from "@/types/organizer.type";

const filterId = "wallet-chart-line-shadow";

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-100 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-main" />
                <p className="font-bold text-[#120101]">${payload[0].value}</p>
            </div>
        );
    }
    return null;
};

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatMonth(value: string) {
    const m = Number(value.split("-")[1]);
    return MONTHS[m - 1] ?? value;
}

interface Props {
    data: TotalEarningsPerMonth[];
    error?: string | null;
}

export default function WalletChart({ data, error }: Props) {
    const chartData = (data ?? []).map((item) => ({
        month: item.month,
        money: item.totalEarning,
    }));

    if (error) {
        return (
            <div className="w-full h-75 mt-4 flex items-center justify-center">
                <p className="text-sm text-red-400">Failed to load chart: {error}</p>
            </div>
        );
    }

    if (!chartData.length) {
        return (
            <div className="w-full h-75 mt-4 flex items-center justify-center">
                <p className="text-sm text-gray-400">No earnings data available.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-75 mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <filter id={filterId} x="-60%" y="-60%" width="160%" height="160%">
                            <feDropShadow dx="0" dy="10" stdDeviation="5" floodColor="#18abc6" floodOpacity="0.35" />
                        </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={formatMonth}
                        tick={{ fill: "#4c4b4b", fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#4c4b4b", fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 2 }} />
                    <Line
                        type="monotone"
                        dataKey="money"
                        stroke="var(--main-color)"
                        strokeWidth={4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter={`url(#${filterId})`}
                        dot={false}
                        activeDot={{ r: 6, fill: "var(--main-color)", stroke: "#fff", strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}