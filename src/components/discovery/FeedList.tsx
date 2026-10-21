"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import PostCard from "@/components/discovery/PostCard";
import { loadMoreFeed } from "@/actions/feed";
import { FeedPage } from "@/services/activity.service";
import { Activity } from "@/types/activity.type";

const SCROLL_KEY = "feed-scroll-id";

interface FeedListProps {
  initialActivities: Activity[];
  initialCursor: string | null;
  initialHasNext: boolean;
}

export default function FeedList({
  initialActivities,
  initialCursor,
  initialHasNext,
}: FeedListProps) {
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["feed"],
      queryFn: ({ pageParam }: { pageParam: string }) =>
        loadMoreFeed(pageParam),
      initialPageParam: initialCursor ?? "",
      getNextPageParam: (lastPage) =>
        lastPage.hasNext && lastPage.nextCursor
          ? lastPage.nextCursor
          : undefined,
      initialData: {
        pages: [
          {
            activities: initialActivities,
            nextCursor: initialCursor,
            hasNext: initialHasNext,
          },
        ],
        pageParams: [initialCursor ?? ""],
      },
    });

  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    const current = queryClient.getQueryData<InfiniteData<FeedPage, string>>([
      "feed",
    ]);
    const currentFirstPage = current?.pages?.[0]?.activities ?? [];
    const sameFirstPage =
      currentFirstPage.length === initialActivities.length &&
      currentFirstPage.every(
        (a, i) => a.activitiesId === initialActivities[i]?.activitiesId,
      );

    if (sameFirstPage) return;

    queryClient.setQueryData<InfiniteData<FeedPage, string>>(["feed"], {
      pages: [
        {
          activities: initialActivities,
          nextCursor: initialCursor,
          hasNext: initialHasNext,
        },
      ],
      pageParams: [initialCursor ?? ""],
    });
  }, [initialActivities, initialCursor, initialHasNext, queryClient]);

  const activities = useMemo(
    () =>
      data.pages.reduce<Activity[]>((acc, page) => {
        const seen = new Set(acc.map((a) => a.activitiesId));
        return [
          ...acc,
          ...page.activities.filter((a) => !seen.has(a.activitiesId)),
        ];
      }, []),
    [data],
  );

  useEffect(() => {
    const handleUnload = () => sessionStorage.removeItem(SCROLL_KEY);
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  useEffect(() => {
    const container = document.getElementById("feed-scroll-container");
    if (!container) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const containerRect = container.getBoundingClientRect();
        const headerHeight =
          container.querySelector<HTMLElement>("[data-feed-header]")
            ?.offsetHeight ?? 0;
        const contentAreaTop = containerRect.top + headerHeight;
        const articles = container.querySelectorAll<HTMLElement>(
          "article[id^='post-']",
        );
        for (const article of articles) {
          if (article.getBoundingClientRect().bottom > contentAreaTop) {
            const offset = Math.round(
              article.getBoundingClientRect().top - contentAreaTop,
            );
            sessionStorage.setItem(
              SCROLL_KEY,
              JSON.stringify({ id: article.id, offset }),
            );
            break;
          }
        }
      });
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const [contentReady, setContentReady] = useState(true);
  useLayoutEffect(() => {
    if (sessionStorage.getItem(SCROLL_KEY)) {
      setContentReady(false);
    }
  }, []);

  const scrollAppliedRef = useRef(false);
  useEffect(() => {
    if (scrollAppliedRef.current || activities.length === 0) return;
    const raw = sessionStorage.getItem(SCROLL_KEY);
    if (!raw) return;
    let saved: { id: string; offset: number };
    try {
      saved = JSON.parse(raw);
    } catch {
      setContentReady(true);
      return;
    }
    const timer = setTimeout(() => {
      if (scrollAppliedRef.current) return;
      scrollAppliedRef.current = true;
      const container = document.getElementById("feed-scroll-container");
      const el = document.getElementById(saved.id);
      if (!container || !el) {
        setContentReady(true);
        return;
      }
      const headerHeight =
        container.querySelector<HTMLElement>("[data-feed-header]")
          ?.offsetHeight ?? 0;
      const contentAreaTop =
        container.getBoundingClientRect().top + headerHeight;
      const currentOffset = el.getBoundingClientRect().top - contentAreaTop;
      container.scrollTop += currentOffset - saved.offset;
      setContentReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [activities.length]);

  return (
    <div
      className={`transition-opacity duration-300 ${contentReady ? "opacity-100" : "opacity-0"}`}
    >
      <InfiniteScroll
        dataLength={activities.length}
        next={() => {
          if (!isFetchingNextPage) fetchNextPage();
        }}
        hasMore={hasNextPage ?? false}
        loader={
          <div className="flex justify-center py-6">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--main-color)] border-t-transparent" />
          </div>
        }
        scrollableTarget="feed-scroll-container"
        style={{ overflow: "visible" }}
      >
        <div className="flex flex-col gap-4 mb-20">
          {activities.map((item) => (
            <PostCard key={item.activitiesId} activity={item} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}
