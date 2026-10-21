"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import { getGalleryAction } from "@/actions/feed";
import dynamic from "next/dynamic";
const GridView = dynamic(() => import("@/components/discovery/GridView"), {
  ssr: false,
});
import { GalleryData } from "@/types/activity.type";
import { GallerySkeleton } from "@/components/discovery/GallerySkeleton";

function GalleryEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <svg
        className="w-16 h-16 text-[var(--text-desc)]"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.52 7.11H21.48"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-[var(--text-desc)] text-lg font-medium">
        No gallery items yet
      </p>
      <p className="text-[var(--text-desc)] text-sm">
        Posts with media will appear here
      </p>
    </div>
  );
}

function GalleryError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <svg
        className="w-16 h-16 text-[var(--accent-color)]"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 8V13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.995 16H12.004"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-[var(--text-main)] text-lg font-medium">
        Failed to load gallery
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-2 rounded-xl bg-main text-[var(--btn-text)] text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}

export default function GridPostCard({
  initialData,
}: {
  initialData?: GalleryData | null;
}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["gallery"],
    queryFn: ({ pageParam }: { pageParam: string | null }) =>
      getGalleryAction(pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [null],
        }
      : undefined,
  });

  const allItems = data?.pages.flatMap((page) => page.content) ?? [];

  // Clear saved item on actual browser reload/close, not on client-side navigation.
  useEffect(() => {
    const handleUnload = () => sessionStorage.removeItem("gallery-last-item");
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // Hide content before first paint if there is a position to restore, so the
  // user never sees the gallery sitting at position 0 before the jump.
  const [contentReady, setContentReady] = useState(true);
  useLayoutEffect(() => {
    if (sessionStorage.getItem("gallery-last-item")) {
      setContentReady(false);
    }
  }, []);

  // Restore scroll to the last clicked gallery item.
  // Uses scrollIntoView (browser handles content-visibility:auto intrinsic sizes
  // correctly) then adjusts by the saved offset so the item lands at the same
  // visual position it was at when the user clicked, not always at the top/center.
  // Flag is set INSIDE the timer so React Strict Mode's cleanup (which cancels
  // the timer on the first mount) doesn't permanently trip the guard.
  const restoredScrollRef = useRef(false);
  useEffect(() => {
    if (restoredScrollRef.current) return;
    const raw = sessionStorage.getItem("gallery-last-item");
    if (!raw) {
      restoredScrollRef.current = true;
      return;
    }
    let saved: { id: string; offset: number };
    try {
      saved = JSON.parse(raw);
    } catch {
      restoredScrollRef.current = true;
      setContentReady(true);
      return;
    }
    const target = document.getElementById(`gallery-item-${saved.id}`);
    if (!target) {
      // Element not in DOM yet — wait for more pages to load.
      if (!hasNextPage) {
        sessionStorage.removeItem("gallery-last-item");
        restoredScrollRef.current = true;
        setContentReady(true);
      }
      return;
    }
    const timer = setTimeout(() => {
      if (restoredScrollRef.current) return;
      restoredScrollRef.current = true;
      const container = document.getElementById("gallery-scroll-container");
      const el = document.getElementById(`gallery-item-${saved.id}`);
      if (!container || !el) {
        setContentReady(true);
        return;
      }
      // scrollIntoView positions the element accurately despite content-visibility:auto.
      // block:"start" puts the item at the container top, then we shift by savedOffset
      // to restore the exact gap between the item and the container top edge.
      el.scrollIntoView({ behavior: "instant", block: "start" });
      container.scrollTop -= saved.offset;
      sessionStorage.removeItem("gallery-last-item");
      setContentReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [data, hasNextPage]);

  if (isLoading) {
    return <GallerySkeleton />;
  }

  if (isError) {
    return <GalleryError onRetry={() => refetch()} />;
  }

  if (allItems.length === 0) {
    return <GalleryEmpty />;
  }

  return (
    <div
      id="gallery-scroll-container"
      className="w-full h-full overflow-y-auto rounded-lg md:rounded-3xl mt-1 pb-28 md:pb-0 [scrollbar:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div
        className={`transition-opacity duration-300 ${contentReady ? "opacity-100" : "opacity-0"}`}
      >
        <InfiniteScroll
          dataLength={allItems.length}
          next={() => {
            if (!isFetchingNextPage) fetchNextPage();
          }}
          hasMore={hasNextPage ?? false}
          loader={
            <div className="flex justify-center py-6">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--main-color)] border-t-transparent" />
            </div>
          }
          scrollableTarget="gallery-scroll-container"
          style={{ overflow: "visible" }}
        >
          <GridView galleryData={allItems} />
        </InfiniteScroll>

        {!hasNextPage && (
          <div className="flex flex-col items-center justify-center py-16 pb-28 select-none">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-[var(--main-color)] opacity-20 blur-xl rounded-full scale-150"></div>
              <div className="relative w-14 h-14 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center text-[var(--main-color)]">
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
            <p className="text-[var(--text-main)] font-bold text-[17px] mb-1.5 tracking-tight">
              You&apos;re all caught up!
            </p>
            <p className="text-[var(--text-secondary)] text-[13px] font-medium max-w-[250px] text-center leading-relaxed">
              You&apos;ve seen all the latest gallery posts. Check back later
              for more!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
