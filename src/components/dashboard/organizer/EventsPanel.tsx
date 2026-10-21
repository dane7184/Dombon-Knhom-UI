"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Tabs } from "@/components/ui/tabs";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import EventCard from "@/components/landing-page/EventCard";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EventManagement, EventManagementPage } from "@/types/organizer.type";
import { deleteEvent } from "@/services/event.service";
import { getEventManagementPage } from "@/services/organizer.service";
import DeleteEventModal from "@/components/modals/DeleteEventModal";

const SCROLL_KEY = "organizer-events-scroll";

const formatDateRange = (start: string, end?: string) => {
  if (!start) return "";
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  const startDate = new Date(start).toLocaleDateString("en-US", options);
  if (!end) return `Date: ${startDate}`;
  const endDate = new Date(end).toLocaleDateString("en-US", options);
  if (startDate === endDate) return `Date: ${startDate}`;
  return `Date: ${startDate} - ${endDate}`;
};

const formatLocation = (loc: string) => {
  if (!loc) return "";
  return loc
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

function isInProgress(evt: EventManagement): boolean {
  if (!evt.startAt) return false;
  try {
    const now = Date.now();
    const start = new Date(evt.startAt).getTime();
    const end = evt.endAt ? new Date(evt.endAt).getTime() : start + 86_400_000;
    return now >= start && now <= end;
  } catch {
    return false;
  }
}

function isUpcoming(startAt: string): boolean {
  if (!startAt) return false;
  try {
    return new Date(startAt).getTime() > Date.now();
  } catch {
    return false;
  }
}

function parseTab(value: string | null): "all" | "in-progress" | "upcoming" {
  const key = String(value ?? "").toLowerCase();

  if (key === "all") return "all";
  if (["inprogress", "in-progress", "in_progress", "in progress"].includes(key))
    return "in-progress";
  if (["upcoming", "up-coming", "up_coming", "up coming"].includes(key))
    return "upcoming";

  return "all";
}

// Find the nearest scrollable ancestor (the dashboard <main> scroll container).
function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el) {
    const style = getComputedStyle(el);
    if (
      /(auto|scroll)/.test(style.overflowY) &&
      el.scrollHeight > el.clientHeight
    ) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

async function fetchEventPage(
  orgId: string,
  cursor: string | null,
): Promise<EventManagementPage> {
  try {
    return await getEventManagementPage(orgId, cursor);
  } catch {
    return { events: [], nextCursor: null, hasNext: false };
  }
}

interface Props {
  orgId: string;
  initialEvents: EventManagementPage;
  initialError?: string | null;
}

export default function EventsClientPanel({
  orgId,
  initialEvents,
  initialError = null,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = React.useState<
    "all" | "in-progress" | "upcoming"
  >(() => parseTab(searchParams?.get?.("tab") ?? null));

  // Keep the active tab in the URL so returning from a detail page restores it:
  //   all → /organizer/events, in-progress → ?tab=inprogress, upcoming → ?tab=upcoming
  const handleTabChange = useCallback(
    (value: string) => {
      const tab = parseTab(value);
      setActiveTab(tab);
      const param =
        tab === "in-progress"
          ? "inprogress"
          : tab === "upcoming"
            ? "upcoming"
            : "";
      router.replace(param ? `${pathname}?tab=${param}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  const rootRef = useRef<HTMLDivElement | null>(null);
  const scrollParentRef = useRef<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const queryKey = useMemo(() => ["organizer", "events", orgId], [orgId]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) =>
        fetchEventPage(orgId, pageParam as string | null),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) =>
        lastPage.hasNext ? lastPage.nextCursor : undefined,
      initialData: {
        pages: [initialEvents],
        pageParams: [null],
      },
      initialDataUpdatedAt: Date.now(),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      enabled: !!orgId,
    });

  const allEvents = useMemo(
    () => data?.pages.flatMap((p) => p.events) ?? [],
    [data],
  );

  const list = useMemo(() => {
    switch (activeTab) {
      case "upcoming":
        return allEvents.filter((e) => isUpcoming(e.startAt));
      case "in-progress":
        return allEvents.filter((e) => isInProgress(e));
      case "all":
      default:
        return allEvents;
    }
  }, [activeTab, allEvents]);

  // ── Restore scroll after returning from a detail page ──────────
  // Keyed by the active tab so each tab restores its own position.
  useEffect(() => {
    scrollParentRef.current = getScrollParent(rootRef.current);
    const saved = sessionStorage.getItem(`${SCROLL_KEY}:${activeTab}`);
    const sc = scrollParentRef.current;
    if (saved && sc) {
      requestAnimationFrame(() => {
        sc.scrollTop = Number(saved);
        sessionStorage.removeItem(`${SCROLL_KEY}:${activeTab}`);
      });
    }
  }, []);

  // ── Save scroll before navigating to a detail page ─────────────
  const saveScroll = useCallback(() => {
    const sc = scrollParentRef.current ?? getScrollParent(rootRef.current);
    if (sc) {
      sessionStorage.setItem(
        `${SCROLL_KEY}:${activeTab}`,
        String(sc.scrollTop),
      );
    }
  }, [activeTab]);

  // ── Infinite scroll sentinel (fires ~80% into the trigger) ─────
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

  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [eventToDelete, setEventToDelete] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const requestDelete = (id: number | string) => {
    const evt = allEvents.find((e) => String(e.eventId) === String(id));
    if (evt) {
      const startDate = new Date(evt.startAt);
      startDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysUntilStart =
        (startDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
      const joinedCount = (evt as any).joined || 0;
      const price = evt.price || 0;
      if (price === 0) {
        if (daysUntilStart < 3) {
          toast.error("Cannot delete free event less than 3 days before start");
          return;
        }
      } else {
        if (joinedCount > 0) {
          toast.error("Cannot delete paid event with registered attendees");
          return;
        }
        if (daysUntilStart < 3) {
          toast.error("Cannot delete paid event less than 3 days before start");
          return;
        }
      }
    }
    setEventToDelete(String(id));
    setDeleteModalOpen(true);
  };

  const requestEdit = (id: number | string) => {
    const evt = allEvents.find((e) => String(e.eventId) === String(id));
    if (evt) {
      const startDate = new Date(evt.startAt);
      startDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysUntilStart =
        (startDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
      const joinedCount = (evt as any).joined || 0;
      const price = evt.price || 0;
      if (price === 0) {
        if (daysUntilStart < 3) {
          toast.error("Cannot edit free event less than 3 days before start");
          return;
        }
      } else {
        if (joinedCount > 0) {
          toast.error("Cannot edit paid event with registered attendees");
          return;
        }
        if (daysUntilStart < 3) {
          toast.error("Cannot edit paid event less than 3 days before start");
          return;
        }
      }
    }
    router.push(`/organizer/events/${id}/edit`);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    setIsDeleting(true);
    try {
      const token = session?.user?.accessToken;
      if (!token) throw new Error("No access token found");
      await deleteEvent(eventToDelete, token);
      toast.success("Event deleted successfully");

      // Remove the deleted event from every loaded page in the cache.
      queryClient.setQueryData<typeof data>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            events: page.events.filter(
              (e) => String(e.eventId) !== eventToDelete,
            ),
          })),
        };
      });
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to delete event");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  const tabOptions = [
    { value: "all", label: "All" },
    { value: "in-progress", label: "In Progress" },
    { value: "upcoming", label: "Upcoming" },
  ];

  if (initialError) {
    return (
      <div className="w-full p-4 rounded-2xl bg-red-50 border border-red-100 text-red-500 text-sm">
        Failed to load events: {initialError}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="w-full">
      <div className="bg-white rounded-2xl p-4 md:p-6 card-shadow">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full flex flex-col"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <DashboardTabs options={tabOptions} />
            <Link
              href="/organizer/events/create"
              className="inline-flex items-center gap-2 bg-main text-white px-4 py-3 rounded-[12px] text-sm font-medium cursor-pointer"
            >
              + Create Event
            </Link>
          </div>

          {list.length === 0 && (
            <div className="w-full py-16 flex flex-col items-center justify-center text-gray-400 gap-2">
              <p className="text-lg font-medium">No events found</p>
              <p className="text-sm">
                {activeTab === "upcoming"
                  ? "No upcoming events scheduled."
                  : activeTab === "in-progress"
                    ? "No events currently in progress."
                    : "Create your first event to get started."}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {list.map((evt) => (
              <EventCard
                key={evt.eventId}
                id={evt.eventId}
                title={evt.title}
                location={formatLocation(
                  (evt as any).address ?? evt.location ?? evt.province ?? "",
                )}
                price={evt.price}
                rating={evt.rating}
                detailsHref={`/organizer/events/${evt.eventId}`}
                date={formatDateRange(evt.startAt, evt.endAt)}
                category={evt.categoryName}
                description={evt.description}
                image={
                  evt.image || (evt as any).cover || (evt as any).coverUrl || ""
                }
                isLiked={evt.isLiked}
                enableShareModal
                onNavigate={saveScroll}
                onDelete={() => requestDelete(evt.eventId)}
                onEdit={() => requestEdit(evt.eventId)}
              />
            ))}
          </div>

          {hasNextPage && (
            <div
              ref={sentinelRef}
              className="w-full h-10 flex items-center justify-center mt-6"
            >
              {isFetchingNextPage && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-(--main-color)" />
              )}
            </div>
          )}
        </Tabs>
        <DeleteEventModal
          isOpen={deleteModalOpen}
          isDeleting={isDeleting}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}
