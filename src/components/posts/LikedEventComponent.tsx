import React from "react";
import "@/app/globals.css";
import { Clock, ArrowRight } from "iconsax-react";
import Link from "next/link";

import { PostDetail } from "@/types/activity.type";
import Image from "next/image";
import { resolveUrl } from "@/lib/format";
interface PostDetailProps {
  post: PostDetail;
}

export const LinkedEventComponent = ({ post }: PostDetailProps) => {
  const { likedEvent } = post;
  if (!likedEvent?.eventId) return null;
  return (
    <div className="w-full p-5 bg-(--background-white) rounded-[15px] box-shadow">
      <h3 className="text-xl font-semibold text-(--secondary-color) mb-3">
        Linked Events
      </h3>
      <div className="p-4 bg-(--background-white) rounded-[10px] box-shadow flex items-center justify-between gap-3 border border-(--input-border) ">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <Image
            src={resolveUrl(likedEvent.eventImage)}
            alt={likedEvent.eventTittle ?? "no title"}
            className="w-20 h-20 rounded-lg object-cover mr-4 shrink-0"
            width={80}
            height={80}
            unoptimized
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-md font-medium truncate sm:whitespace-normal sm:overflow-visible">
              {likedEvent.eventTittle}
            </h4>
            <p className="text-sm text-gray-500 truncate sm:whitespace-normal sm:overflow-visible">
              {likedEvent.location}
            </p>
            <div className="flex items-center mt-2 min-w-0">
              <Clock
                size="16"
                className="text-gray-500 mr-2 shrink-0"
                color="#6B7280"
              />
              <span className="text-sm text-gray-500 truncate sm:whitespace-normal sm:overflow-visible">
                {likedEvent.startDate} - {likedEvent.stopDate}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 border border-(--main-color) p-3 rounded-xl shrink-0">
          <Link href={`/events/${likedEvent.eventId}`} className="-rotate-45">
            <ArrowRight size="24" color="#18ABC6" />
          </Link>
        </div>
      </div>
    </div>
  );
};
