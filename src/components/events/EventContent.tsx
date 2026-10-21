"use client";

import "@/app/globals.css";
import { EventEngagementBar } from "./EventEngagementBar";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { resolveUrl } from "@/lib/format";
import Image from "next/image";
import { EventDetail } from "@/types/event.type";

interface EventContentProps {
  event: EventDetail;
  hideBackButton?: boolean;
}

export const EventContent = ({ event, hideBackButton }: EventContentProps) => {
  const { title } = event;
  const router = useRouter();

  return (
    <div className="w-full p-5 bg-white rounded-[15px] shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        {!hideBackButton && (
          <button
            type="button"
            onClick={() => router.back()}
            className="hidden md:flex w-10 h-10 cursor-pointer items-center justify-center rounded-full hover:bg-slate-50 transition-colors border-none bg-transparent"
          >
            <ArrowLeft size={26} color="#18ABC6" />
          </button>
        )}
        <h2 className="flex-1 min-w-0 text-2xl font-bold text-(--secondary-color) truncate" title={title}>{title}</h2>
      </div>

      <div className="relative w-full h-56 sm:h-80 md:h-125 mb-2 overflow-hidden rounded-lg bg-black/5">
        <Image
          src={resolveUrl(event.imageUrl)}
          alt={title}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
      </div>

      <EventEngagementBar event={event} />
    </div>
  );
};
