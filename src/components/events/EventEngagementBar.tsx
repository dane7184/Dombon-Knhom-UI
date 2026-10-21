"use client";

import React, { useEffect, useState } from "react";
import { Heart, Send, MessageText1 } from "iconsax-react";
import ShareModal from "@/components/discovery/SharePopup";
import { EventDetail } from "@/types/event.type";
import { toggleLikeAction } from "@/actions/event.actions";
import { useEventStore } from "@/store/useEventStore";
import { useSession } from "next-auth/react";
import EventOptionsModal from "../modals/EventOptionsModal";
import { eventUrl } from "@/lib/url";

interface EventEngagementBarProps {
  event: EventDetail;
}

export const EventEngagementBar = ({ event }: EventEngagementBarProps) => {
  const { isLiked, totalLikes, totalComments, init, toggleLike } =
    useEventStore();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { data: session } = useSession();
  const currentUserId = session?.user?.userId;
  const currentOrgId = session?.user?.orgId;

  const isOrgMode = !!currentOrgId;

  const ownerId = event.creatorId ?? event.organizerId;
  const isOwner = isOrgMode
    ? Boolean(event.organizerId && event.organizerId === currentOrgId)
    : Boolean(event.creatorId && event.creatorId === currentUserId);

  // Init store once with server data
  useEffect(() => {
    init({
      isLiked: event.isLiked,
      totalLikes: event.totalLikes,
      totalComments: event.totalComments,
    });
  }, [event.isLiked, event.totalLikes, event.totalComments, init]);

  const handleLikeToggle = async () => {
    const nextState = !isLiked;
    toggleLike(); // Optimistic update
    try {
      localStorage.setItem(`event_like_${event.id}`, String(nextState));
      window.dispatchEvent(new Event('like_sync'));
    } catch (e) {}

    const result = await toggleLikeAction(event.id);
    if ("error" in result) {
      toggleLike(); // Rollback if failed
      try {
        localStorage.setItem(`event_like_${event.id}`, String(!nextState));
        window.dispatchEvent(new Event('like_sync'));
      } catch (e) {}
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-6">
          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            className="group flex items-center gap-2 text-slate-700 transition-colors cursor-pointer"
          >
            <Heart
              size={22}
              color={isLiked ? "#FF0000" : "#1D2939"}
              variant={isLiked ? "Bold" : "Linear"}
              className="transition-all duration-200 ease-out group-hover:scale-125 group-active:scale-95"
            />
            <span className="text-sm font-semibold text-slate-800 select-none">
              {totalLikes}
              <span className="hidden md:inline">
                {" "}
                {totalLikes === 1 ? "Like" : "Likes"}
              </span>
            </span>
          </button>

          {/* Comment Counter */}
          <div className="flex items-center gap-2 text-slate-700">
            <MessageText1 size={22} color="#1D2939" variant="Linear" />
            <span className="text-sm font-semibold text-slate-800 select-none">
              {totalComments}
              <span className="hidden md:inline">
                {" "}
                {totalComments === 1 ? "Comment" : "Comments"}
              </span>
            </span>
          </div>

          {/* Share Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="group flex items-center gap-2 text-slate-700 transition-colors cursor-pointer"
          >
            <Send
              size={22}
              color="#1D2939"
              variant="Linear"
              className="transition-all duration-300 ease-out hover:scale-115 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:-rotate-45 group-active:translate-y-0 group-active:translate-x-0 group-active:rotate-0"
            />
            <span className="text-sm font-semibold text-slate-800 select-none">
              Share
            </span>
          </button>
        </div>

        <div className="cursor-pointer">
          <EventOptionsModal
            contentId={"" + event.id}
            isOwner={isOwner}
            isSaved={event.isSaved}
            onDeleteSuccess={() => {}}
            event={event}
          />
        </div>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          shareUrl={eventUrl(event.id)}
        />
      </div>
    </div>
  );
};
