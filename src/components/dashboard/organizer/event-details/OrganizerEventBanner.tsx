"use client";

import { Share2 } from "lucide-react";
import { Heart, Message } from "iconsax-react";
import { useState } from "react";
import type { EventDetail } from "@/types/event.type";
import SharePopup from "@/components/discovery/SharePopup";
import { resolveUrl } from "@/lib/format";
import Image from "next/image";
import {toggleLikeEvent} from "@/services/profileInfo.service";
import {useSession} from "next-auth/react";

export default function OrganizerEventBanner({
  event,
}: {
  event: EventDetail;
}) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(event.isLiked);
  const [likes, setLikes] = useState(event.totalLikes);
  const [shareOpen, setShareOpen] = useState(false);
  const token = session?.user?.accessToken;

  if (!token) {
    return null;
  }

  const handleLikeToggle = async () => {
    // Optimistic update
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));

    const ok = await toggleLikeEvent(event.id, token);
    // Rollback if failed
    if (!ok) {
      setLiked((prev) => !prev);
      setLikes((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  return (
    <section className="rounded-[24px] bg-white p-4 sm:p-5 shadow-sm border border-slate-100">
      <h1 className="text-lg sm:text-xl font-bold secondary-color mb-3">
        {event.title}
      </h1>
      <div className="relative overflow-hidden rounded-[18px] bg-slate-100 aspect-16/10">
        <Image
          src={resolveUrl(event.imageUrl)}
          alt={event.title}
          className="object-cover"
          fill
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-slate-600">
        <button
          onClick={handleLikeToggle}
          className="inline-flex items-center gap-2 cursor-pointer"
        >
          <Heart
            size={16}
            variant={liked ? "Bold" : "Linear"}
            color={liked ? "#ff4d57" : "currentColor"}
          />
          <span>{likes} likes</span>
        </button>

        <div className="inline-flex items-center gap-2">
          <Message size={16} className="text-(--main-color)" />
          <span>{event.totalComments} comments</span>
        </div>

        <button
          onClick={() => setShareOpen(true)}
          className="inline-flex items-center gap-2 cursor-pointer"
        >
          <Share2 size={16} className="text-slate-500" />
          <span>Share</span>
        </button>
      </div>

      <SharePopup
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        shareUrl={`https://dombon.design/events/${event.id}`}
      />
    </section>
  );
}
