"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { SearchBarComponent } from "./SearchBarComponent";
import EventCardComponent from "./EventCardComponent";
import { EventProfileRespone } from "@/types/event.type";
import { CursorData } from "@/types/common.type";
import { getAttendedEventsPage } from "@/services/profileInfo.service";

interface AttendedEventListProps {
  userId: string;
  initialData: CursorData<EventProfileRespone>;
}

export default function AttendedEventList({ userId, initialData }: AttendedEventListProps) {
  const [events, setEvents] = useState<EventProfileRespone[]>(initialData.content);
  const [nextCursor, setNextCursor] = useState<string>(initialData.nextCursor ?? "");
  const [hasNext, setHasNext] = useState(initialData.hasNext);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchMore = useCallback(async () => {
    if (loading || !hasNext || !nextCursor) return;
    setLoading(true);
    try {
      const data: CursorData<EventProfileRespone> = await getAttendedEventsPage(userId, nextCursor);

      setEvents((prev) => [...prev, ...(data.content ?? [])]);
      setNextCursor(data.nextCursor ?? "");
      setHasNext(data.hasNext ?? false);
    } catch (err) {
      console.error("Failed to load more attended events:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasNext, nextCursor, userId]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) fetchMore(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchMore]);

  return (
    <div className="flex flex-col gap-5 pb-5">
      <div className="w-full sm:w-[33%]">
        <SearchBarComponent
          value={searchTerm}
          onChangeAction={setSearchTerm}
          placeholder="Search by name..."
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((event) => (
            <EventCardComponent key={event.eventId} {...event} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-desc text-center">No events found.</p>
        </div>
      )}

      <div ref={sentinelRef} className="flex justify-center py-4">
        {loading && (
          <div className="w-6 h-6 border-2 border-t-transparent border-(--primary) rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}