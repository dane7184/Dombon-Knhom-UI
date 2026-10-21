"use client";

import React, { useState } from "react";
import "@/app/globals.css";
import { Edit } from "iconsax-react";
import { X } from "lucide-react";
import { EventDetail } from "@/types/event.type";
import { rateEventAction } from "@/actions/event.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Toast from "../modals/Toast";

interface EventRateComponentProps {
  event: EventDetail;
}

export const EventRateComponent = ({ event }: EventRateComponentProps) => {
  const { ratingSummary, totalRatings } = event;
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [score, setScore] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Get first and last agenda entries across all days
  const agendaDays = Object.entries(event.agenda).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  const lastDay = agendaDays[agendaDays.length - 1];

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

  // const startDateISO = toISODateString(event.startDate);
  // const endDateISO = toISODateString(event.endDate);

  // const eventStartDateTime = firstItem
  //   ? new Date(`${startDateISO}T${to24Hour(firstItem.startTime)}:00+07:00`)
  //   : new Date(`${startDateISO}T00:00:00+07:00`);

  // const eventEndDateTime = lastItem
  //   ? new Date(`${endDateISO}T${to24Hour(lastItem.endTime)}:00+07:00`)
  //   : new Date(`${endDateISO}T23:59:59+07:00`);

  // const now = new Date();
  // const hasStarted = now >= eventStartDateTime;
  // const hasEnded = now > eventEndDateTime;

  const startDateISO = toISODateString(event.startDate);
  const endDateISO = toISODateString(event.endDate);

  const todayISO = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Phnom_Penh",
  }); // "YYYY-MM-DD"

  const hasStarted = todayISO >= startDateISO;
  const hasEnded = todayISO > endDateISO;

  // Hide if event hasn't ended
  if (!hasEnded) return null;

  // Inside component, add:
  const router = useRouter();

  // Update handleSubmitRating:
  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await rateEventAction(event.id, score, review);
    setSubmitting(false);

    if ("success" in result) {
      setShowRatingModal(false);
      setReview("");
      toast.custom((t) => (
        <Toast
          title="Success"
          message={result.message}
          type="success"
          onCloseAction={() => toast.dismiss(t)}
        />
      ));
      router.refresh();
    } else {
      toast.custom((t) => (
        <Toast
          title="Error"
          message={result.message}
          type="error"
          onCloseAction={() => toast.dismiss(t)}
        />
      ));
    }
  };

  const starRows = [
    { label: "5", value: ratingSummary?.fiveStar ?? 0 },
    { label: "4", value: ratingSummary?.fourStar ?? 0 },
    { label: "3", value: ratingSummary?.threeStar ?? 0 },
    { label: "2", value: ratingSummary?.twoStar ?? 0 },
    { label: "1", value: ratingSummary?.oneStar ?? 0 },
  ];

  return (
    <>
      <div className="w-full p-5 bg-(--background-white) rounded-[15px] box-shadow flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-(--secondary-color)">
            Overall Rating
          </h3>
          <button
            onClick={() => setShowRatingModal(true)}
            className="py-1.5 gap-1.5 px-3 flex items-center rounded-xl bg-white border border-(--main-color) hover:bg-slate-50 cursor-pointer transition-colors text-sm font-medium"
          >
            <Edit size="18" color="var(--main-color)" />
            <span className="text-(--main-color)">Write review</span>
          </button>
        </div>

        <div className="flex items-center justify-center flex-col py-2">
          <h1 className="text-[54px] font-extrabold text-slate-900 tracking-tight leading-none">
            {ratingSummary?.average ? ratingSummary.average.toFixed(1) : "0.0"}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {event.ratingSummary?.total} reviews
          </p>
        </div>

        <div className="flex flex-col justify-center items-center">
          <p className="text-xs text-center text-slate-400 mb-4 max-w-[80%]">
            Overall rating score based on genuine experiences from participants
          </p>
          <div className="flex gap-3.5 flex-col w-full max-w-[85%]">
            {starRows.map((row) => (
              <div
                key={row.label}
                className="w-full flex items-center gap-3 text-sm text-slate-600 font-medium"
              >
                <span className="w-3 text-center shrink-0">{row.label}</span>
                <div className="flex-1">
                  <progress
                    value={row.value}
                    max={totalRatings || 1}
                    className="w-full h-2.5 [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-(--main-color) [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full transition-all"
                  />
                </div>
                <span className="w-8 text-right text-xs text-slate-400 font-normal shrink-0">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write Review Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-115 w-full shadow-xl relative flex flex-col items-center animate-in fade-in slide-in-from-bottom-6 duration-300">
            <button
              onClick={() => setShowRatingModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>

            <div className="text-center w-full mb-6">
              <h3 className="text-xl font-bold text-(--secondary-color) leading-tight mb-2">
                Rate Your Experience
              </h3>
              <p className="text-sm text-[#7886a6]">
                How would you rate your experience on our website?
              </p>
            </div>

            <form
              onSubmit={handleSubmitRating}
              className="flex flex-col gap-6 w-full"
            >
              <div className="flex gap-2.5 justify-center w-full">
                {([1, 2, 3, 4, 5] as const).map((s) => {
                  const isActive = s <= score;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScore(s)}
                      className="w-13 h-13 flex items-center justify-center rounded-xl border border-[#E2E8F0] bg-white cursor-pointer transition-all"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={isActive ? "#FFC107" : "#CBD5E1"}
                        className="w-7 h-7"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label className="text-sm font-semibold text-(--secondary-color)">
                  Tell us about your experience{" "}
                  <span className="text-sm font-normal text-slate-500">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Write your feedback here..."
                  rows={4}
                  className="w-full border border-[#E2E8F0] rounded-2xl p-4 text-sm resize-none focus:outline-none focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/10 placeholder-slate-400"
                />
              </div>

              <div className="flex gap-3 w-full mt-2">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold bg-(--main-color) hover:opacity-90 text-white cursor-pointer transition-opacity disabled:opacity-40"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
