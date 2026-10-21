"use client";

import { Star } from "lucide-react";
import type { EventDetail } from "@/types/event.type";

export default function OrganizerEventScore({ event }: { event: EventDetail }) {
  const { ratingSummary, totalRatings } = event;

  const starRows = [
    { stars: 5, value: ratingSummary?.fiveStar ?? 0 },
    { stars: 4, value: ratingSummary?.fourStar ?? 0 },
    { stars: 3, value: ratingSummary?.threeStar ?? 0 },
    { stars: 2, value: ratingSummary?.twoStar ?? 0 },
    { stars: 1, value: ratingSummary?.oneStar ?? 0 },
  ];

  return (
    <section className="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold secondary-color">Overall Score</h2>
      </div>

      <div className="text-center">
        <div className="text-5xl font-extrabold secondary-color">
          {ratingSummary?.average ? ratingSummary.average.toFixed(1) : "0.0"}
        </div>
        <div className="mt-2 flex items-center justify-center gap-1 text-[#f59e0b]">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} size={18} fill="currentColor" />
          ))}
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {totalRatings.toLocaleString()} ratings
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Overall rating score based on experiences from users
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {starRows.map((item) => (
          <div key={item.stars} className="flex items-center gap-3 text-sm">
            <span className="w-3 text-slate-500">{item.stars}</span>
            <div className="flex-1">
              <progress
                value={item.value}
                max={totalRatings || 1}
                className="w-full h-2 [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:bg-[#18abc6] [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full"
              />
            </div>
            <span className="w-6 text-right text-xs text-slate-400">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
