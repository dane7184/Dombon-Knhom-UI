import DateTabBar from "@/components/home/DateTabBar";
import ViewTabBar from "@/components/home/ViewToggleBar";
import MapClientLoader from "@/components/home/MapClientLoader";
import { formatDateString } from "@/services/event.service";
import { getAllEvents } from "@/services/event.service";
import { MapEvent } from "@/types/event.type";
import { Suspense } from "react";

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
    // Events happening today: not ended before today + started before/on today
    startFrom = todayStr; // endDate >= today (not ended yet)
    endAt = todayStr; // startDate <= today (already started)
  } else if (params.range === "upcoming") {
    // Events not started yet: startDate > today
    startFrom = tomorrowStr; // endDate >= tomorrow (so startDate must be >= tomorrow too)
    endAt = null; // no upper bound
  } else {
    // All active/future (default) — not ended yet
    startFrom = params.from ?? todayStr; // endDate >= today by default
    endAt = params.to ?? null;
  }

  let events: MapEvent[] = [];
  try {
    events = await getAllEvents({
      search: params.q || null,
      province: params.province || null,
      district: params.district || null,
      commune: params.commune || null,
      categoryIds: params.cat ? params.cat.split(",").filter(Boolean) : null,
      startFrom,
      endAt,
    });
  } catch (error) {
    console.error("Unable to load events:", error);
  }

  return (
    <div className="relative w-full h-screen">
      <ViewTabBar />
      <Suspense fallback={null}>
        <DateTabBar />
      </Suspense>
      <MapClientLoader events={events ?? []} />
    </div>
  );
}
