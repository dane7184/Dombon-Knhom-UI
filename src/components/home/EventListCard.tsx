"use client";

import {
  Heart,
  Location,
  Calendar,
  ArrowRight2,
  Send,
} from "iconsax-react";
import { BookmarkIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import SharePopup from "@/components/discovery/SharePopup";
import { AppBaseCategoryType } from "@/types/common.type";
import {
  CATEGORY_CONFIG,
  resolveCategoryKey,
} from "@/constant/category.config";
import "@/app/globals.css";
import { resolveUrl } from "@/lib/format";
import Image from "next/image";
import { toggleLikeAction, toggleSaveAction } from "@/actions/event.actions";
import { showToast } from "@/lib/myToast";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { EventListResult } from "@/services/event.service";
import { eventUrl } from "@/lib/url";

export interface EventProps {
  id: number | string;
  title: string;
  location: string;
  price: number;
  rating: number;
  startDate: string;
  endDate: string;
  category: AppBaseCategoryType;
  description: string;
  image: string | null;
  isLiked?: boolean;
  isSaved?: boolean;
  onNavigate?: () => void;
}

export default function EventListCard({
  id,
  category,
  startDate,
  endDate,
  location,
  image,
  price,
  description,
  title,
  rating,
  isLiked,
  isSaved,
  onNavigate,
}: EventProps) {
  const isFree = price === 0 || price.toString().toUpperCase() === "FREE";
  const [isLikedState, setIsLikedState] = useState(isLiked ?? false);
  const [isBookmarked, setIsBookmarked] = useState(isSaved ?? false);
  const [showModal, setShowModal] = useState(false);

  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const filterKey = searchParams.toString();

  const configKey = resolveCategoryKey(category);
  const config = CATEGORY_CONFIG[configKey];
  const CategoryIcon = config.icon;

  // ── Sync React Query cache so back-navigation shows correct state ──
  const updateCache = (field: "isLiked" | "isSaved", value: boolean) => {
    queryClient.setQueryData<InfiniteData<EventListResult>>(
      ["events", "list", filterKey],
      (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            events: page.events.map((event) =>
              String(event.id) === String(id)
                ? { ...event, [field]: value }
                : event,
            ),
          })),
        };
      },
    );
  };

  // ── Like debounce ─────────────────────────────────────────────
  const prevDebouncedLike = useRef(isLikedState);
  const debouncedLike = useDebounce(isLikedState, 1000);

  useEffect(() => {
    if (debouncedLike === prevDebouncedLike.current) return;
    prevDebouncedLike.current = debouncedLike;
    toggleLikeAction(String(id)).then((result) => {
      if ("error" in result) {
        setIsLikedState((prev) => !prev);
        updateCache("isLiked", !debouncedLike);
      } else {
        updateCache("isLiked", debouncedLike);
      }
    });
  }, [debouncedLike]);

  // ── Save debounce ─────────────────────────────────────────────
  const prevDebouncedSave = useRef(isBookmarked);
  const debouncedSave = useDebounce(isBookmarked, 1000);

  useEffect(() => {
    if (debouncedSave === prevDebouncedSave.current) return;
    prevDebouncedSave.current = debouncedSave;
    toggleSaveAction(String(id)).then((result) => {
      if ("error" in result) {
        setIsBookmarked((prev) => !prev);
        updateCache("isSaved", !debouncedSave);
        showToast("error", { description: "Failed to save event." });
      } else {
        updateCache("isSaved", debouncedSave);
      }
    });
  }, [debouncedSave]);

  // ── Handlers — just flip state, debounce + useEffect handles API ──
  const handleLikeToggle = () => setIsLikedState((prev) => !prev);
  const handleSaveToggle = () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    // Toast immediately on tap; the debounced effect handles the API call
    // (and shows an error toast if it ultimately fails).
    showToast(next ? "success" : "deleteSuccess", {
      description: next ? "Event saved successfully" : "Event removed from saved",
    });
  };

  return (
    <>
      <div
        dir="ltr"
        className="w-full bg-white rounded-2xl md:rounded-[12px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-gray-50/50"
      >
        <div className="relative w-full aspect-16/10 sm:aspect-video overflow-hidden shrink-0 bg-slate-100">
          <Image
            src={resolveUrl(image)}
            alt={title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition duration-500"
            fill
          />

          <div className="absolute top-3 left-3 bg-(--secondary-color) backdrop-blur-md px-3 py-1.5 rounded-full text-xs sm:text-sm font-normal flex items-center gap-1.5 text-white z-10">
            <Location
              size={16}
              color="currentColor"
              className="text-gray-200 shrink-0"
            />
            <span className="truncate max-w-25 sm:max-w-37.5">{location}</span>
          </div>

          <div
            className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm z-10 ${isFree ? "bg-[#E8F7FA] main-color" : "bg-[#ffeaf0] text-(--accent-color)"}`}
          >
            {isFree ? "FREE" : `$${price}`}
          </div>

          <div className="absolute bottom-3 left-4 right-4 text-white z-10">
            <h3 className="text-base sm:text-lg md:text-xl font-bold drop-shadow-md line-clamp-1">
              {title}
            </h3>
          </div>

          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none z-0"></div>
        </div>

        <div className="px-4 py-3 flex-1 flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 text-[#475467] text-xs sm:text-sm font-medium min-w-0">
                <Calendar
                  size={20}
                  color="currentColor"
                  className="main-color shrink-0"
                />
                <span className="truncate">
                  Date: {startDate} - {endDate}
                </span>
              </div>
              <button
                className="text-black hover:text-gray-600 transition p-1 cursor-pointer"
                onClick={handleSaveToggle}
              >
                <BookmarkIcon
                  size={25}
                  color={isBookmarked ? "#FDB022" : "#475467"}
                  fill={isBookmarked ? "#FDB022" : "none"}
                />
              </button>
            </div>

            <div>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 border text-[10px] font-bold rounded-full tracking-widest uppercase shrink-0"
                style={{
                  backgroundColor: config.bg,
                  borderColor: config.color,
                  color: config.color,
                }}
              >
                <CategoryIcon size={12} strokeWidth={2.5} />
                {category}
              </span>
            </div>

            <p className="text-[#475467] line-clamp-2 min-h-[2.85rem] text-sm font-normal leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 shrink-0">
            <div className="flex gap-4 text-gray-400">
              <button
                className="group/like transition p-1 cursor-pointer"
                onClick={handleLikeToggle}
              >
                <Heart
                  size={22}
                  color={isLikedState ? "#FF0000" : "#1D2939"}
                  variant={isLikedState ? "Bold" : "Linear"}
                  className="transition-all duration-200 ease-out group-hover/like:scale-125 group-active/like:scale-95"
                />
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="group/share transition p-1 cursor-pointer"
              >
                <Send
                  size={22}
                  color="#1D2939"
                  variant="Linear"
                  className="transition-all duration-300 ease-out group-hover/share:-translate-y-1 group-hover/share:translate-x-1 group-hover/share:-rotate-45"
                />
              </button>
            </div>

            <Link
              href={`/events/${id}`}
              onClick={onNavigate}
              className="text-xs sm:text-sm font-normal text-gray-700 flex items-center gap-1 hover:text-(--main-color) transition group-hover:text-(--main-color)"
            >
              <span>View Details</span>
              <ArrowRight2
                size={12}
                color="currentColor"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>

      <SharePopup
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        shareUrl={eventUrl(String(id))}
      />
    </>
  );
}
