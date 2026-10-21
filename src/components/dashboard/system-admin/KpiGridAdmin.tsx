"use client";

import React from "react";
import { Calendar, DollarCircle, People } from "iconsax-react";
import { DashboardStats } from "@/services/admin.service";
import { BookImage } from "lucide-react";

interface KpiGridProps {
  dataKPI?: DashboardStats;
}

export default function KpiGridAdmin({ dataKPI }: KpiGridProps) {
  const renderIcon = (name: string) => {
    switch (name) {
      case "Calendar":
        return <Calendar size={30} variant="Linear" color="#ffffff" />;
      case "Activities":
        return <BookImage size={30} color="#ffffff" />;
      case "Users":
        return <People size={30} color="#ffffff" />;
      case "Money":
        return <DollarCircle size={30} variant="Linear" color="#ffffff" />;
      default:
        return null;
    }
  };

  const metrics = [
    {
      title: "Total Activities",
      value: dataKPI?.totalActivities ?? 0,
      iconBg: "bg-[#ffa800]",
      dotColor: "bg-[#ffa800]",
      iconName: "Activities",
    },
    {
      title: "Total Events",
      value: dataKPI?.totalEvents ?? 0,
      iconBg: "bg-[#18abc6]",
      dotColor: "bg-[#18abc6]",
      iconName: "Calendar",
    },
    {
      title: "Total User",
      value: dataKPI?.totalUsers ?? 0,
      iconBg: "bg-[#fd346e]",
      dotColor: "bg-[#fd346e]",
      iconName: "Users",
    },
    {
      title: "Money Earn",
      value: `$${dataKPI?.moneyEarn ?? 0}`,
      iconBg: "bg-[#22c55e]",
      dotColor: "bg-[#22c55e]",
      iconName: "Money",
    },
  ];

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full shrink-0">
      {metrics.map((card, index) => {
        const hexColor =
          card.dotColor.match(/#[0-9A-Fa-f]{6}/)?.[0] || "#18abc6";

        return (
          <div
            key={index}
            className="bg-white p-5 sm:p-6 lg:p-7 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center transition-all duration-300"
          >
            <div className="flex flex-col gap-3 sm:gap-5 min-w-0">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: `${hexColor}26` }}
                >
                  <span
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                    style={{ backgroundColor: hexColor }}
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
              style={{ boxShadow: `0 8px 16px -4px ${hexColor}80` }}
            >
              {renderIcon(card.iconName)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
