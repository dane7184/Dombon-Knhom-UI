"use client";

import React, { useMemo } from "react";
import { People, MenuBoard, Calendar } from "iconsax-react";
import { ModeratorKPI } from "@/types/moderator.type";

interface ModeratorKpiGridProps {
  mockModerator: ModeratorKPI;
}

export default function ModeratorKpiGrid({
  mockModerator,
}: ModeratorKpiGridProps) {
  const kpiData = useMemo(
    () => [
      {
        title: "Total Organization",
        value: mockModerator.totalOrg,
        icon: <People size={30} color="#ffffff" />,
        iconBg: "bg-[var(--main-color)]",
        lightBg: "bg-sky-500/15",
        dotBg: "bg-[var(--main-color)]",
        shadowVar: "var(--main-color)",
      },
      {
        title: "Total Report",
        value: mockModerator.totalReport,
        icon: <MenuBoard size={30} color="#ffffff" />,
        iconBg: "bg-[var(--accent-color)]",
        lightBg: "bg-pink-500/15",
        dotBg: "bg-[var(--accent-color)]",
        shadowVar: "var(--accent-color)",
      },
      {
        title: "Total Event",
        value: mockModerator.totalEvent,
        icon: <Calendar size={30} color="#ffffff" />,
        iconBg: "bg-[var(--warning-color)]",
        lightBg: "bg-orange-500/15",
        dotBg: "bg-[var(--warning-color)]",
        shadowVar: "var(--warning-color)",
      },
    ],
    [mockModerator],
  );

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full shrink-0">
      {kpiData.map((card, index) => (
        <div
          key={index}
          className="bg-white p-5 sm:p-6 lg:p-7 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center transition-all duration-300"
        >
          <div className="flex flex-col gap-3 sm:gap-5 min-w-0">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${card.lightBg} shrink-0 flex items-center justify-center`}
              >
                <span
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${card.dotBg}`}
                />
              </div>

              <p className="text-sm sm:text-base lg:text-lg font-medium text-(--text-desc) truncate">
                {card.title}
              </p>
            </div>

            <p className="text-2xl sm:text-3xl font-bold text-black truncate">
              {card.value}
            </p>
          </div>

          <div
            className={`p-4 rounded-full ${card.iconBg} shrink-0 flex items-center justify-center ml-2`}
            style={{
              boxShadow: `0 8px 16px -4px color-mix(in srgb, ${card.shadowVar} 50%, transparent)`,
            }}
          >
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}