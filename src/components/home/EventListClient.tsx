"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import EventListCard from "@/components/home/EventListCard";
import { EventListResult, formatDateString, getEventList } from "@/services/event.service";
import { useSearchParams } from "next/navigation";

const SCROLL_KEY = "event-list-scroll";

interface EventListClientProps {
  initialData: EventListResult;
}

async function fetchEventPage(
  searchParams: URLSearchParams,
  cursor: string | null,
): Promise<EventListResult> {
  // Same query string as before: getEventList serializes these in this order.
  return getEventList({
    search: searchParams.get("q"),
    province: searchParams.get("province"),
    district: searchParams.get("district"),
    commune: searchParams.get("commune"),
    categoryIds: searchParams.get("cat") ? [searchParams.get("cat")!] : null,
    startFrom: searchParams.get("from") || formatDateString(new Date()),
    endAt: searchParams.get("to"),
    cursor,
    size: 20,
  });
}

export default function EventListClient({ initialData }: EventListClientProps) {
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filterKey = searchParams.toString();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["events", "list", filterKey],
      queryFn: ({ pageParam }) =>
        fetchEventPage(searchParams, pageParam as string | null),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) =>
        lastPage.hasNext ? lastPage.nextCursor : undefined,
      initialData: {
        pages: [initialData],
        pageParams: [null],
      },
      initialDataUpdatedAt: Date.now(),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false, // ← prevents tab switch from collapsing pages back to page 1
    });

  const events = data.pages.flatMap((p) => p.events);

  // ── Restore scroll after navigation ──────────────────────────
  useEffect(() => {
    const saved = sessionStorage.getItem(`${SCROLL_KEY}:${filterKey}`);
    if (!saved || !containerRef.current) return;
    requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = Number(saved);
        sessionStorage.removeItem(`${SCROLL_KEY}:${filterKey}`);
      }
    });
  }, []);

  // ── Save scroll before navigating ────────────────────────────
  const saveScroll = useCallback(() => {
    if (containerRef.current) {
      sessionStorage.setItem(
        `${SCROLL_KEY}:${filterKey}`,
        String(containerRef.current.scrollTop),
      );
    }
  }, [filterKey]);

  // ── Infinite scroll sentinel ──────────────────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.8 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div
      ref={containerRef}
      className="flex-1 md:overflow-y-auto w-full rounded-xl no-scrollbar"
    >
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {events.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 font-medium">
            No active or upcoming events found matching your filter options.
          </div>
        ) : (
          events.map((item) => (
            <EventListCard
              key={item.id}
              id={item.id}
              category={item.category}
              startDate={item.startDate}
              endDate={item.endDate}
              location={item.location.province ?? ""}
              image={item.imageUrl}
              price={item.price}
              description={item.description}
              title={item.title}
              rating={item.rating}
              isLiked={item.isLiked}
              isSaved={item.isSaved}
              onNavigate={saveScroll}
            />
          ))
        )}
      </div>

      {hasNextPage && (
        <div
          ref={sentinelRef}
          className="w-full h-10 flex items-center justify-center mt-6"
        >
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-(--main-color)" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
