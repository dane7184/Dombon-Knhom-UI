"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "@/app/globals.css";
import { Calendar } from "iconsax-react";
import { Star } from "lucide-react";
import { EventDetail } from "@/types/event.type";
import { getEventRatings } from "@/services/event.service";
import { resolveAvatarUrl } from "@/lib/format";
import Image from "next/image";

const INITIAL_SIZE = 3;

interface ReviewComponentProps {
  event: EventDetail;
}

export const ReviewComponent = ({ event }: ReviewComponentProps) => {
  const [reviews, setReviews] = useState(
    event.inlineRatings.slice(0, INITIAL_SIZE),
  );
  const [page, setPage] = useState(1);
  const [isLast, setIsLast] = useState(
    event.inlineRatings.length <= INITIAL_SIZE,
  );
  const [loading, setLoading] = useState(false);

  // Get first and last agenda entries across all days
  const agendaDays = Object.entries(event.agenda).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  const firstDay = agendaDays[0];
  const lastDay = agendaDays[agendaDays.length - 1];

  const firstItem = firstDay?.[1].sort((a, b) => a.order - b.order)[0];
  const lastItems = lastDay?.[1].sort((a, b) => a.order - b.order);
  const lastItem = lastItems?.[lastItems.length - 1];

  function to24Hour(timeStr: string): string {
    const cleaned = timeStr.toUpperCase().trim();
    const isPM = cleaned.includes("PM");
    const isAM = cleaned.includes("AM");
    const match = cleaned.match(/(\d+):(\d+)/);
    if (!match) return "00:00";

    let hours = parseInt(match[1], 10);
    const minutes = match[2];

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  }

  // Convert display date "Jun 14, 2026" → "2026-06-14"
  function toISODateString(displayDate: string): string {
    const d = new Date(displayDate);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const startDateISO = toISODateString(event.startDate);
  const endDateISO = toISODateString(event.endDate);

  const eventStartDateTime = firstItem
    ? new Date(`${startDateISO}T${to24Hour(firstItem.startTime)}:00+07:00`)
    : new Date(`${startDateISO}T00:00:00+07:00`);

  const eventEndDateTime = lastItem
    ? new Date(`${endDateISO}T${to24Hour(lastItem.endTime)}:00+07:00`)
    : new Date(`${endDateISO}T23:59:59+07:00`);

  const now = new Date();
  const hasEnded = now > eventEndDateTime;

  if (!hasEnded) return null;

  if (reviews.length === 0) return null;

  const handleLoadMore = async () => {
    setLoading(true);
    const nextPage = page + 1;
    const result = await getEventRatings(event.id, nextPage, INITIAL_SIZE);
    setReviews((prev) => [...prev, ...result.ratings]);
    setPage(nextPage);
    setIsLast(result.isLast);
    setLoading(false);
  };

  // Test
  useEffect(() => {
    setReviews(event.inlineRatings.slice(0, INITIAL_SIZE));
    setIsLast(event.inlineRatings.length <= INITIAL_SIZE);
    setPage(1);
  }, [event.inlineRatings]);

  return (
    <div className="w-full p-5 bg-(--background-white) rounded-[15px] box-shadow flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-(--secondary-color)">
        Reviews
      </h3>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-[12px] border border-(--input-border) p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <Link
                  href={`/profile/${review.reviewer.id}`}
                  className="shrink-0"
                >
                  <Image
                    src={resolveAvatarUrl(review.reviewer.avatarUrl)}
                    alt={review.reviewer.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </Link>
                <div className="min-w-0">
                  <Link
                    href={`/profile/${review.reviewer.id}`}
                    className="text-sm font-semibold truncate"
                  >
                    {review.reviewer.name}
                  </Link>
                  <div className="-mt-3 text-xs text-muted-foreground">
                    <Calendar size="14" />
                    <span>{review.reviewedAt}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs flex gap-1 font-semibold text-(--secondary-color) whitespace-nowrap">
                <Star size="14" color="#FFC107" />
                {review.score}/5
              </p>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-5">
              {review.review}
            </p>
          </article>
        ))}
      </div>

      {!isLast && (
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="text-center text-slate-400 hover:text-slate-600 text-xs font-medium pt-2 cursor-pointer transition-colors disabled:opacity-40"
        >
          {loading ? "Loading..." : "Load more reviews"}
        </button>
      )}
    </div>
  );
};
