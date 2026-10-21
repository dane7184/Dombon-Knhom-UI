"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { EventDetail } from "@/types/event.type";
import { getEventRatings } from "@/services/event.service";
import { resolveAvatarUrl } from "@/lib/format";

const REVIEWS_PER_PAGE = 3;

export default function OrganizerEventReviews({
  event,
}: {
  event: EventDetail;
}) {
  const [reviews, setReviews] = useState(event.inlineRatings);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(event.totalRatings);
  const [totalPages, setTotalPages] = useState(
    Math.max(1, Math.ceil(event.totalRatings / REVIEWS_PER_PAGE)),
  );

  const handlePageChange = async (page: number) => {
    const result = await getEventRatings(event.id, page, REVIEWS_PER_PAGE);
    setReviews(result.ratings);
    setCurrentPage(page);
    setTotalElements(result.totalElements);
    setTotalPages(result.totalPages);
  };

  const startItem =
    totalElements === 0 ? 0 : (currentPage - 1) * REVIEWS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * REVIEWS_PER_PAGE, totalElements);

  const pageItems = useMemo(() => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 2) return [1, 2, "ellipsis", totalPages];
    if (currentPage >= totalPages - 1)
      return [1, "ellipsis", totalPages - 1, totalPages];
    return [1, "ellipsis", currentPage, "ellipsis2", totalPages];
  }, [currentPage, totalPages]);

  return (
    <section className="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100">
      <h2 className="text-lg font-bold secondary-color mb-4">Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">
          No reviews yet.
        </p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-[18px] border border-slate-100 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-100">
                    <Image
                      src={resolveAvatarUrl(review.reviewer.avatarUrl)}
                      alt={review.reviewer.name}
                      className="object-cover"
                      fill
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold secondary-color">
                      {review.reviewer.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {review.reviewedAt}
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#f59e0b]">
                  <Star size={14} fill="currentColor" />
                  {review.score}/5
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {review.review}
              </p>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-end justify-between gap-4 text-sm text-slate-500">
          <span>
            Showing {startItem} to {endItem} of {totalElements.toLocaleString()}{" "}
            reviews
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] border border-slate-200 bg-white text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>

            {pageItems.map((item, index) =>
              typeof item === "string" ? (
                <span key={`ellipsis-${index}`} className="px-1 text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => handlePageChange(Number(item))}
                  className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] border text-xs font-medium transition ${
                    currentPage === Number(item)
                      ? "border-[#18abc6] bg-[#18abc6] text-white"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {item}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] border border-slate-200 bg-white text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
