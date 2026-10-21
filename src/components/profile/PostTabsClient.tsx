"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import PostCard from "../profile/PostCard";
import { ActivitiesResponse } from "@/types/activity.type";
// import { CursorData } from "@/types/activity.type";
import { getActivitiesPage } from "@/services/profileInfo.service";
import { CursorData } from "@/types/common.type"; 

interface PostTabsClientProps {
  userId: string;
  isOrgProfile?: boolean;
  initialData: CursorData<ActivitiesResponse>;
}

export default function PostTabsClient({
  userId,
  isOrgProfile = false,
  initialData,
}: PostTabsClientProps) {
  const [activities, setActivities] = useState<ActivitiesResponse[]>(initialData.content);
  const [nextCursor, setNextCursor] = useState<string | null>(initialData.nextCursor ?? "");
  const [hasNext, setHasNext] = useState(initialData.hasNext);
  const [loading, setLoading] = useState(false);
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

  const fetchMore = useCallback(async () => {
    if (loading || !hasNext || !nextCursor) return;
    setLoading(true);
    try {
      const data: CursorData<ActivitiesResponse> = await getActivitiesPage(
        userId,
        nextCursor,
        isOrgProfile,
      );

      setActivities((prev) => [...prev, ...(data.content ?? [])]);
      setNextCursor(data.nextCursor ?? null);
      setHasNext(data.hasNext ?? false);
    } catch (err) {
      console.error("Failed to load more activities:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasNext, nextCursor, userId, isOrgProfile]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchMore();
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchMore]);

  const total = activities.length;
  const lastRowStart = total > 0 ? Math.floor((total - 1) / cols) * cols : 0;

  return (
    <>
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-desc text-sm font-medium">No posts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 mb-5">
          {activities.map((activity, i) => {
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
      )}

      <div ref={sentinelRef} className="flex justify-center py-4">
        {loading && (
          <div className="w-6 h-6 border-2 border-t-transparent border-(--primary) rounded-full animate-spin" />
        )}
      </div>
    </>
  );
}