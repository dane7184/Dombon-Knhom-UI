import Image from "next/image";
import {EventReportDetail} from "@/types/admin.type";
import "@/app/globals.css";
import { CATEGORY_CONFIG, contentTypeStyles } from "@/constant/category.config";
import { formatDate, resolveUrl } from "@/lib/format";
import React from "react";

interface EventHeaderProps {
    event: EventReportDetail;
    reportStatus?: "Pending" | "Approved" | "Rejected";
    onApprove: () => void;
    onReject: () => void;
}

export default function EventHeader({
  event,
  reportStatus,
  onApprove,
  onReject,
}: EventHeaderProps) {
  const config =
    CATEGORY_CONFIG[event.category as keyof typeof CATEGORY_CONFIG];
  const { icon: Icon, color, bg } = config;
  return (
    <div className="bg-white rounded-xl h-full shadow-sm p-3 flex items-stretch gap-6">
      {/* Event Cover Image */}
      <div className="shrink-0 w-1/2 space-y-2">
        <div className="relative rounded-xl overflow-hidden h-90 bg-slate-100">
          <Image
            key={event.image}
            src={resolveUrl(event.image)}
            alt={event.name}
            fill
            className="object-cover transition-opacity duration-300"
          />
        </div>
      </div>

      {/* Event Info */}
      <div className="flex-1 flex flex-col min-w-0">
        <div>
          <span
            className={`text-sm font-medium px-2 py-0.5 mt-3 rounded-full border ${contentTypeStyles[event.type as keyof typeof contentTypeStyles] ?? "border-gray-300 bg-gray-50 text-gray-600"}`}
          >
            {event.type}
          </span>

          <h2 className="font-semibold text-(--secondary-color) mt-1.5 text-base">
            {event.name}
          </h2>

          <div className="mt-1 space-y-2 text-md text-(--secondary-color)">
            <div className="flex items-center gap-1.5">
              <CalendarIcon />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <LocationIcon  />
              <span className="text-md">{event.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PeopleIcon />
              <span className="text-md">
                {event.joined} /{" "}
                {event.capacity ? event.capacity.toLocaleString() : 0} joined
              </span>
            </div>
          </div>

          {/* Category badge */}
          <span
            className="inline-flex items-center gap-1.5 text-sm font-medium px-2 py-0.5 mt-2 rounded-full border w-fit"
            style={{ backgroundColor: bg, color: color, borderColor: color }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: color }} />
            {event.category}
          </span>
        </div>
      </div>

      {/* Right: Total Report + Buttons */}
      <div className="flex flex-col justify-between mr-6 items-end shrink-0 self-stretch">
        <div className="flex flex-col items-end gap-0.5">
          <p className="text-md font-bold text-(--secondary-color) ">
            Total Report
          </p>
          <p className="text-4xl font-bold text-(--secondary-color)">
            {event.totalReport}
          </p>
        </div>

        {reportStatus === "Pending" && (
          <div className="flex gap-3">
            <button
              onClick={onApprove}
              className="bg-(--main-color) w-36 cursor-pointer h-10 rounded-[0.5rem] hover:bg-(--main-color)/80 text-white text-sm font-medium px-4 py-1.5 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={onReject}
              className="bg-(--accent-color) cursor-pointer w-36 h-10 rounded-[0.5rem] hover:bg-(--accent-color)/80 text-white text-sm font-medium px-4 py-1.5 transition-colors"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CalendarIcon() {
  return (
    <Image
      src="/images/calendar-remove.svg"
      alt="Calendar"
      width={14}
      height={14}
      className="text-(--secondary-color) w-4 h-4 shrink-0"
    />
  );
}

export function LocationIcon() {
  return (
    <Image
      src="/images/location.svg"
      alt="Location"
      width={14}
      height={14}
      className="w-4 h-4 shrink-0"
    />
  );
}

export function PeopleIcon() {
  return (
    <Image
      src="/images/profile-2user.png"
      alt="People"
      width={14}
      height={14}
      className="w-4 h-4 shrink-0"
    />
  );
}