"use client";

import { Suspense } from "react";
import { useMapFilter } from "@/hooks/useMapFilter";
import { DateRangeFilter } from "@/services/event.service";

const DATE_TABS: { label: string; value: DateRangeFilter }[] = [
  { label: "All Events", value: "all" },
  { label: "Today", value: "today" },
  { label: "Upcoming", value: "upcoming" },
];

function DateTabBarInner() {
  const [filter, setFilter] = useMapFilter();

  return (
    // Mobile/tablet: right-4, same top-30 as ViewTabBar, tabs are h-8 to match
    // lg+: original centered at top-28
    <div className="absolute top-28 right-4 lg:top-28 lg:right-auto lg:left-1/2 lg:-translate-x-1/2 z-500 flex items-center gap-1 bg-(--main-color) rounded-lg p-1.5 shadow-lg">
      {DATE_TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() =>
            setFilter({ dateRange: tab.value, from: null, to: null })
          }
          // Mobile: h-8 fixed height to match ViewTabBar and MapControls buttons
          // lg+: original px-8 py-2
          className={`h-8 px-2.5 lg:h-auto lg:px-8 lg:py-2 rounded-md text-[12px] lg:text-sm font-semibold transition-colors whitespace-nowrap ${
            filter.dateRange === tab.value
              ? "bg-white text-(--secondary-color) shadow"
              : "text-white cursor-pointer hover:bg-white/10"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default function DateTabBar() {
  return (
    <Suspense fallback={null}>
      <DateTabBarInner />
    </Suspense>
  );
}
