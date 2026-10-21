import React from "react";
import { WalletEventList } from "@/types/event.type";
import { Calendar, Location, ArrowRight2 } from "iconsax-react";
import { resolveUrl } from "@/lib/format";
import Image from "next/image";
import Link from "next/link";

export default function WalletEventComponent({
  eventId,
  title,
  cover,
  price,
  startAt,
  endAt,
  province,
}: WalletEventList) {
  return (
    <div className="flex p-2 border border-(--input-border) card-shadow rounded-lg">
      <div className="w-[30%] sm:w-[25%] shrink-0 rounded-lg overflow-hidden">
        <div className="relative w-full h-24 sm:h-32">
          <Image
            src={resolveUrl(cover)}
            alt={title}
            className="object-cover"
            fill
          />
        </div>
      </div>
      <div className="flex justify-between ms-2 sm:ms-4 min-w-0 flex-1">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-main line-clamp-2">{title}</h3>
          <p className="text-desc text-xs sm:text-sm mt-0.5 flex gap-1.5 items-center">
            <Calendar size={14} color="#18ABC6" />
            <span className="truncate">{startAt} - {endAt}</span>
          </p>
          <p className="text-desc text-xs sm:text-sm mt-0.5 flex gap-1.5 items-center">
            <Location size={14} color="#18ABC6" />
            <span className="truncate">{province?.replace(/_/g, ' ')}</span>
          </p>
        </div>
        <div className="flex flex-col justify-between items-end gap-2 p-1 shrink-0 ms-1">
          <p className="text-xs sm:text-sm font-semibold text-(--main-color) px-2 sm:px-4 py-1 bg-[#E8F7FA] rounded-full whitespace-nowrap">
            $ {price.toFixed(2)}
          </p>
          <Link
            href={`/events/${eventId}`}
            className="text-xs sm:text-sm text-main flex gap-1 items-center font-medium hover:text-(--main-color) whitespace-nowrap"
          >
            View Detail <ArrowRight2 size={14} color="#1C274C" />
          </Link>
        </div>
      </div>
    </div>
  );
}
