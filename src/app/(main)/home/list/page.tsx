import React, { Suspense } from "react";
import FilterPanelWrapper from "@/components/home/FilterPanelWrapper";
import MapListToggle from "@/components/home/ViewToggleButton";
import FilterEventDate from "@/components/home/FilterEventDate";
import EventListClient from "@/components/home/EventListClient";
import {
  getEventList,
  EventListResult,
  formatDateString,
} from "@/services/event.service";
import { getCategories, Category } from "@/services/category.service";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    cat?: string;
    range?: string;
    from?: string;
    to?: string;
    province?: string;
    district?: string;
    commune?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const today = new Date();
  const todayStr = formatDateString(today);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDateString(tomorrow);

  let startFrom: string | null = null;
  let endAt: string | null = null;

  if (params.range === "today") {
    startFrom = todayStr;
    endAt = todayStr;
  } else if (params.range === "upcoming") {
    startFrom = tomorrowStr;
    endAt = null;
  } else {
    startFrom = params.from ?? todayStr;
    endAt = params.to ?? null;
  }

  let initialData: EventListResult = {
    events: [],
    nextCursor: null,
    hasNext: false,
  };
  let categories: Category[] = [];

  try {
    [initialData, categories] = await Promise.all([
      getEventList({
        search: params.q || null,
        province: params.province || null,
        district: params.district || null,
        commune: params.commune || null,
        categoryIds: params.cat ? params.cat.split(",").filter(Boolean) : null,
        startFrom,
        endAt,
      }),
      getCategories(),
    ]);
  } catch (error) {
    console.error("Unable to load events:", error);
  }

  return (
    // h-screen + overflow-hidden on ALL screen sizes — locks the page so nothing outside the event list scrolls
    <div className="pt-28 md:pt-28 px-4 md:px-4 pb-4 flex flex-col md:flex-row h-screen w-full overflow-hidden bg-background gap-4 md:gap-4">
      {/* FilterPanel — collapsible on mobile (shrink-0), full-height sidebar on md+ */}
      <div className="shrink-0 w-full md:w-[20%] md:h-full">
        <FilterPanelWrapper categories={categories} />
      </div>

      {/* Right column — fills remaining height, never overflows */}
      <div className="flex flex-col flex-1 min-h-0 gap-4 md:gap-4">
        {/* Top bar stays fixed: toggle left, date filter right */}
        <div className="w-full flex flex-row items-center justify-between gap-4 shrink-0">
          <MapListToggle />
          <FilterEventDate />
        </div>

        {/* Only this scrolls — on both mobile and desktop */}
        <div className="flex-1 min-h-0 overflow-y-auto rounded-xl no-scrollbar pb-28 md:pb-0">
          <Suspense fallback={null}>
            <EventListClient initialData={initialData} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
