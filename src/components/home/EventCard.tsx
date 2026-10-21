"use client";

import { CalendarDays, ChevronRight, MapPin, Star } from "lucide-react";
import {
  CATEGORY_CONFIG,
  resolveCategoryKey,
} from "@/constant/category.config";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { MapEvent } from "@/types/event.type";
import { resolveUrl } from "@/lib/format";

interface EventCardProps {
  event: MapEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const configKey = resolveCategoryKey(event.category);
  const config = CATEGORY_CONFIG[configKey];
  const [imgSrc, setImgSrc] = useState(event.imageUrl);
  const fallbackSrc = "/images/default-fallback-image.png";
  const priceLabel = event.isFree ? "Free" : `$${event.price}`;

  const dateLabel =
    event.startDate === event.endDate
      ? event.startDate
      : `${event.startDate} – ${event.endDate}`;

  return (
    // Mobile: tighter padding, smaller gap; lg+: original w-md p-3 gap-3
    <div className="w-full lg:w-md max-w-full flex bg-white rounded-xl lg:rounded-2xl p-2 lg:p-3 gap-2 lg:gap-3 shadow-sm border-2 border-(--main-color) border-dashed select-none">
      {/* Thumbnail: 72px on mobile, 100px (w-25) on desktop */}
      <div className="w-18 h-18 lg:w-25 lg:h-25 shrink-0 rounded-lg lg:rounded-xl overflow-hidden bg-slate-100 relative border border-slate-100">
        <Image
          src={resolveUrl(imgSrc)}
          alt={event.title}
          fill
          sizes="(max-width: 1024px) 72px, 100px"
          className="object-cover"
          loading="lazy"
          onError={() => setImgSrc(fallbackSrc)}
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        {/* Title + price badge */}
        <div className="flex items-start justify-between gap-1.5">
          <h3 className="text-[13px] lg:text-[16px] font-bold text-slate-800 leading-snug line-clamp-1 flex-1 m-0">
            {event.title}
          </h3>
          <span
            className="text-[11px] lg:text-[15px] font-bold px-2 lg:px-3 py-0.5 rounded-full whitespace-nowrap tracking-wide shrink-0"
            style={{
              background: event.isFree ? "#dcf2f6" : `${config.color}15`,
              color: event.isFree ? "#18abc6" : config.color,
            }}
          >
            {priceLabel}
          </span>
        </div>

        {/* Date + location */}
        <div className="flex flex-col gap-0.5 lg:gap-1">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={12} className="text-(--main-color) shrink-0" />
            <span className="text-[11px] lg:text-xs font-medium text-(--secondary-color) truncate">
              {dateLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-(--main-color) shrink-0" />
            <span className="text-[11px] lg:text-xs font-medium text-(--secondary-color) truncate max-w-36 lg:max-w-50">
              {[
                event.location.province ?? "",
                event.location.district ?? "",
                event.location.commune ?? "",
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
        </div>

        {/* Rating + view details */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-50/60">
          <div className="flex items-center gap-1.5">
            <Star size={12} color="#f59e0b" fill="#f59e0b" />
            <span className="text-[11px] lg:text-sm font-bold text-(--secondary-color)">
              {event.rating > 0 ? event.rating.toFixed(1) : "New"}
            </span>
          </div>
          <Link
            href={`/events/${event.id}`}
            className="flex items-center gap-0.5 text-[11px] lg:text-xs font-medium transition-opacity hover:opacity-80 cursor-pointer text-slate-800"
          >
            View Details
            <ChevronRight size={12} className="text-slate-800 lg:hidden" />
            <ChevronRight
              size={14}
              className="text-slate-800 hidden lg:block"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
