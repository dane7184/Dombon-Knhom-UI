"use client";

import { useMemo } from "react";
import { DocumentText, TickCircle, Timer, CloseCircle } from "iconsax-react";

interface DashboardStats {
  totalRequests?: number;
  approved?: number;
  pending?: number;
  rejected?: number;
}

interface KpiGridProps {
  dataKpi?: DashboardStats | null;
}

export default function WithdrawalKpi({ dataKpi }: KpiGridProps) {

  // Data arrives from the service layer via the page (getWithdrawalKpi);
  // a missing response renders zeros instead of placeholder rows.
  const counts = useMemo(
    () => ({
      total: dataKpi?.totalRequests ?? 0,
      approved: dataKpi?.approved ?? 0,
      pending: dataKpi?.pending ?? 0,
      rejected: dataKpi?.rejected ?? 0,
    }),
    [dataKpi],
  );

  const kpiData = [
    {
      title: "Total Requests",
      value: counts.total,
      icon: <DocumentText size={30} variant="Linear" color="#ffffff" />,
      iconBg: "bg-cyan-500",
      lightBg: "bg-cyan-500/15",
    },
    {
      title: "Approved",
      value: counts.approved,
      icon: <TickCircle size={30} variant="Linear" color="#ffffff" />,
      iconBg: "bg-emerald-500",
      lightBg: "bg-emerald-500/15",
    },
    {
      title: "Pending",
      value: counts.pending,
      icon: <Timer size={30} variant="Linear" color="#ffffff" />,
      iconBg: "bg-amber-500",
      lightBg: "bg-amber-500/15",
    },
    {
      title: "Rejected",
      value: counts.rejected,
      icon: <CloseCircle size={30} variant="Linear" color="#ffffff" />,
      iconBg: "bg-rose-500",
      lightBg: "bg-rose-500/15",
    },
  ];

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full mb-4 shrink-0">
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
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${card.iconBg}`}
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
            className={`p-4 rounded-full ${card.iconBg} shrink-0 flex items-center justify-center shadow-md ml-2`}
          >
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
