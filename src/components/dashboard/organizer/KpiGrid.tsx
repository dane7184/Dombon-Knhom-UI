import React from "react";
import {
  Calendar,
  Star,
  Heart,
  DollarCircle,
} from "iconsax-react";
import {OrganizerKpi} from "@/types/organizer.type";

interface Props {
  data: OrganizerKpi | null;
  error?: string | null;
}

export default function KpiGrid({ data, error }: Props) {
  const renderIcon = (name: string) => {
    switch (name) {
      case "Calendar":
        return (
            <Calendar
                size={30}
                variant="Linear"
                color="#ffffff"
            />
        );

      case "Star":
        return (
            <Star
                size={30}
                variant="Linear"
                color="#ffffff"
            />
        );

      case "Heart":
        return (
            <Heart
                size={30}
                variant="Linear"
                color="#ffffff"
            />
        );

      case "Money":
        return (
            <DollarCircle
                size={30}
                variant="Linear"
                color="#ffffff"
            />
        );

      default:
        return null;
    }
  };

  const metrics = [
    {
      title: "Total Events",
      value: data?.totalEvents ?? 0,
      iconName: "Calendar",
      dotColor: "#18ABC6",
      iconBg: "bg-cyan-500",
    },
    {
      title: "Favorites",
      value: data?.totalFavorites ?? 0,
      iconName: "Heart",
      dotColor: "#F97316",
      iconBg: "bg-orange-500",
    },
    {
      title: "Money Earned",
      value: `$${(data?.totalMoneyEarned ?? 0).toLocaleString()}`,
      iconName: "Money",
      dotColor: "#22C55E",
      iconBg: "bg-green-500",
    },
    {
      title: "Ratings",
      value: data?.totalRatings ?? 0,
      iconName: "Star",
      dotColor: "#EAB308",
      iconBg: "bg-yellow-500",
    },
  ];

  if (error) {
    return <div className="text-red-500 text-sm">Failed to load KPI: {error}</div>;
  }

  return (
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full shrink-0">
        {metrics.map((card, index) => {
          const hexColor =
              card.dotColor.match(/#[0-9A-Fa-f]{6}/)?.[0] ||
              "#18abc6";

          return (
              <div
                  key={index}
                  className="bg-white p-5 sm:p-6 lg:p-7 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center transition-all"
              >
                <div className="flex flex-col gap-3 sm:gap-5 min-w-0">
                  <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full shrink-0 flex items-center justify-center"
                        style={{
                          backgroundColor: `${hexColor}26`,
                        }}
                    >
                  <span
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                      style={{
                        backgroundColor: hexColor,
                      }}
                  />
                    </div>

                    <p className="text-sm sm:text-base lg:text-lg font-medium text-(--text-desc)">
                      {card.title}
                    </p>
                  </div>

                  <p className="text-2xl sm:text-3xl font-bold text-black">
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