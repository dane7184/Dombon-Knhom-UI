"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBarComponent } from "./SearchBarComponent";
import FilterSaved from "./FilterSaved";
import PostCard from "./PostCard";
import EventCardComponent from "./EventCardComponent";
import { AppContentType, CursorData } from "@/types/common.type";
import { EventProfileRespone } from "@/types/event.type";
import { ActivitiesResponse } from "@/types/activity.type";
import { getSavedActivitiesPage, getSavedEventsPage } from "@/services/profileInfo.service";

const deduped = <T,>(list: T[], key: keyof T): T[] =>
  list.filter((item, index, self) => index === self.findIndex((t) => t[key] === item[key]));

interface SavedListProps {
  userId: string;
  isOrgProfile: boolean;
  initialEvents: CursorData<EventProfileRespone>;
  initialActivities: CursorData<ActivitiesResponse>;
}

export default function SavedList({ userId, isOrgProfile, initialEvents, initialActivities }: SavedListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeContent = (searchParams.get("content") as AppContentType) ?? "Event";

  // Events state
  const [events, setEvents] = useState<EventProfileRespone[]>(() => deduped(initialEvents.content, "eventId"));
  const [eventsNextCursor, setEventsNextCursor] = useState<string | null>(initialEvents.nextCursor ?? "");
  const [eventsHasNext, setEventsHasNext] = useState(initialEvents.hasNext);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Activities state
  const [activities, setActivities] = useState<ActivitiesResponse[]>(() => deduped(initialActivities.content, "activityId"));
  const [activitiesNextCursor, setActivitiesNextCursor] = useState<string | null>(initialActivities.nextCursor ?? "");
  const [activitiesHasNext, setActivitiesHasNext] = useState(initialActivities.hasNext);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(4);

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth < 640) setCols(2);
      else if (window.innerWidth < 768) setCols(3);
      else setCols(4);
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleUnsave = (eventId: string) => {
    setEvents((current) => current.filter((e) => e.eventId !== eventId));
  };

  const handleContentChange = (content: AppContentType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("content", content);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const fetchMoreEvents = useCallback(async () => {
    if (eventsLoading || !eventsHasNext || !eventsNextCursor) return;
    setEventsLoading(true);
    try {
      const data: CursorData<EventProfileRespone> = await getSavedEventsPage(
        userId,
        eventsNextCursor,
        isOrgProfile,
      );
      setEvents((prev) => deduped([...prev, ...(data.content ?? []).map(e => ({ ...e, isSaved: true }))], "eventId"));
      setEventsNextCursor(data.nextCursor ?? null);
      setEventsHasNext(data.hasNext ?? false);
    } catch (err) {
      console.error("Failed to load more saved events:", err);
    } finally {
      setEventsLoading(false);
    }
  }, [eventsLoading, eventsHasNext, eventsNextCursor, userId, isOrgProfile]);

  const fetchMoreActivities = useCallback(async () => {
    if (activitiesLoading || !activitiesHasNext || !activitiesNextCursor) return;
    setActivitiesLoading(true);
    try {
      const data: CursorData<ActivitiesResponse> = await getSavedActivitiesPage(
        userId,
        activitiesNextCursor,
        isOrgProfile,
      );
      setActivities((prev) => deduped([...prev, ...(data.content ?? [])], "activityId"));
      setActivitiesNextCursor(data.nextCursor ?? null);
      setActivitiesHasNext(data.hasNext ?? false);
    } catch (err) {
      console.error("Failed to load more saved activities:", err);
    } finally {
      setActivitiesLoading(false);
    }
  }, [activitiesLoading, activitiesHasNext, activitiesNextCursor, userId, isOrgProfile]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const fetchMore = activeContent === "Event" ? fetchMoreEvents : fetchMoreActivities;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) fetchMore(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeContent, fetchMoreEvents, fetchMoreActivities]);

  const isLoading = activeContent === "Event" ? eventsLoading : activitiesLoading;

  return (
    <div className="flex flex-col gap-5 pb-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <div className="w-full sm:w-[33%]">
          {activeContent === "Event" && (
            <SearchBarComponent
              value={searchTerm}
              onChangeAction={setSearchTerm}
              placeholder="Search saved events by name..."
            />
          )}
        </div>
        <FilterSaved onChange={handleContentChange} />
      </div>

      {activeContent === "Activity" ? (
        activities.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {activities.map((activity, i) => {
              const total = activities.length;
              const lastRowStart = total > 0 ? Math.floor((total - 1) / cols) * cols : 0;
              const col = i % cols;
              const isFirstRow = i < cols;
              const isLastRow = i >= lastRowStart;
              const isFirstCol = col === 0;
              const isLastColInRow = col === cols - 1 || i === total - 1;

              const tl = isFirstRow && isFirstCol ? "rounded-tl-xl" : "";
              const tr = isFirstRow && (col === cols - 1 || (total <= cols && i === total - 1)) ? "rounded-tr-xl" : "";
              const bl = isLastRow && isFirstCol ? "rounded-bl-xl" : "";
              const br = isLastRow && isLastColInRow ? "rounded-br-xl" : "";

              return (
                <div key={activity.activityId} className={`overflow-hidden ${tl} ${tr} ${bl} ${br}`}>
                  <PostCard {...activity} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-2"><p className="text-desc text-center">No saved activities.</p></div>
        )
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredEvents.map((event) => (
            <EventCardComponent key={event.eventId} {...event} onUnsave={handleUnsave} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-2"><p className="text-desc text-center">No saved events.</p></div>
      )}

      <div ref={sentinelRef} className="flex justify-center py-4">
        {isLoading && (
          <div className="w-6 h-6 border-2 border-t-transparent border-(--primary) rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}