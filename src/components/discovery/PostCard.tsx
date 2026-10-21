"use client";

import React, { startTransition, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import Image from "next/image";
import { Bookmark } from "lucide-react";
import { ActivityCarousal } from "@/components/discovery/ActivityCarousal";
import { Heart, Send, MessageText1, Note } from "iconsax-react";
import ReportModal from "@/components/modals/ReportModal";
import Link from "next/link";
import ShareModal from "@/components/discovery/SharePopup";
import { useRouter } from "next/navigation";
import { revalidateDiscovery } from "@/actions/feed";
import {
  toggleLikeActivity,
  toggleSavedActivity,
} from "@/services/activity.service";
import { resolveAvatarUrl } from "@/lib/format";
import { formatCount } from "@/lib/utils";
import { Activity } from "@/types/activity.type";
import { useQueryClient } from "@tanstack/react-query";
import { eventUrl, postUrl } from "@/lib/url";
import { showToast } from "@/lib/myToast";

export interface PostCardProps {
  activity: Activity;
  index?: number;
}
export default React.memo(function PostCard({
  activity,
  index,
}: PostCardProps) {
  const {
    activitiesId,
    user,
    media,
    createdAt,
    linkedEvent,
    commentsCount,
    isOwner,
  } = activity;
  const [actualPost, setActualPost] = useState(activity);

  const content = actualPost.content;
  const tags = actualPost.tags;
  const location = actualPost.location;

  const router = useRouter();
  const queryClient = useQueryClient();
  const [openShare, setOpenShare] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);

  const CAPTION_LIMIT = 150;
  const isCaptionLong = !!content && content.length > CAPTION_LIMIT;

  const profileHref = `/profile/${user.userId}`;
  const shareUrl = linkedEvent
    ? eventUrl(String(linkedEvent.eventId))
    : postUrl(activitiesId);
  // ── Like debounce ─────────────────────────────────────────────
  const prevDebouncedLike = useRef(actualPost.isLiked);
  const debouncedLike = useDebounce(actualPost.isLiked, 500);

  useEffect(() => {
    if (debouncedLike === prevDebouncedLike.current) return;
    prevDebouncedLike.current = debouncedLike;
    toggleLikeActivity(activitiesId).catch((err) => {
      console.error("Failed to toggle like:", err);
      // rollback state on error
      setActualPost((p) => ({
        ...p,
        isLiked: !debouncedLike,
        likes: !debouncedLike ? p.likes + 1 : p.likes - 1,
      }));
    });
  }, [debouncedLike, activitiesId]);

  // ── Save debounce ─────────────────────────────────────────────
  const prevDebouncedSave = useRef(actualPost.isSaved);
  const debouncedSave = useDebounce(actualPost.isSaved, 500);

  useEffect(() => {
    if (debouncedSave === prevDebouncedSave.current) return;
    prevDebouncedSave.current = debouncedSave;
    toggleSavedActivity(activitiesId).catch((err) => {
      console.error("Failed to toggle save:", err);
      // rollback state on error
      setActualPost((p) => ({ ...p, isSaved: !debouncedSave }));
      showToast("error", { description: "Failed to save post." });
    });
  }, [debouncedSave, activitiesId]);

  function handleLike() {
    const next = !actualPost.isLiked;
    setActualPost((p) => ({
      ...p,
      isLiked: next,
      likes: next ? p.likes + 1 : p.likes - 1,
    }));
  }

  function handleSave() {
    const next = !actualPost.isSaved;
    setActualPost((p) => ({ ...p, isSaved: next }));
    showToast(next ? "success" : "deleteSuccess", {
      description: next
        ? "Post saved successfully"
        : "Post removed from saved",
    });
  }

  // Clicking anywhere on the card opens the post detail, except when the
  // click lands on an interactive control (buttons, links, the video player).
  function handleCardClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (
      target.closest(
        'a, button, video, input, [role="button"], [role="menuitem"], [role="dialog"], [role="menu"]',
      )
    )
      return;

    if (
      target.closest("[data-radix-popper-content-wrapper], [data-radix-portal]")
    )
      return;

    router.push(`/posts/${activitiesId}`);
  }

  return (
    <article
      id={`post-${activitiesId}`}
      onClick={handleCardClick}
      className="w-full bg-(--background-white) rounded-xl card-shadow border border-(--input-border) overflow-hidden"
    >
      <div className="py-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={profileHref} className="flex items-center">
            <Image
              src={
                user.profileImage
                  ? resolveAvatarUrl(user.profileImage)
                  : "/images/fallback-pf.png"
              }
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover profile-border"
              width={40}
              height={40}
              onError={(e) => {
                e.currentTarget.src = "/images/fallback-pf.png";
                e.currentTarget.srcset = "";
              }}
            />
          </Link>

          <div className="flex flex-col">
            <p className="text-sm text-foreground">
              <Link
                href={profileHref}
                className="font-bold text-(--text-title) inline-flex items-center gap-1"
              >
                <span className="mr-1">{user.username}</span>
                {user.isOrg && (
                  <Image
                    src="/images/Verified.svg"
                    alt="Verified Organizer"
                    width={14}
                    height={14}
                    className="inline-block mr-1"
                  />
                )}
              </Link>
              {location && (
                <>
                  <span className="text-(--text-secondary)">is at</span>{" "}
                  {location}
                </>
              )}
            </p>
            <span className="text-xs text-(--text-desc)">{createdAt}</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className="text-black hover:text-gray-600 transition p-1 cursor-pointer"
          >
            <Bookmark
              size={22}
              color={actualPost.isSaved ? "#FDB022" : "#475467"}
              fill={actualPost.isSaved ? "#FDB022" : "none"}
            />
          </button>
          <ReportModal
            postOwnerId={user.userId}
            contentType="post"
            contentId={activity.activitiesId}
            isOwner={isOwner}
            isSaved={actualPost.isSaved}
            onToggleSave={handleSave}
            initialData={{
              activityId: activity.activitiesId,
              content: content || "",
              tags: tags || [],
              location: location || "",
              event: linkedEvent?.eventId ? linkedEvent.eventId.toString() : "",
              files: media.map((m, idx) => ({
                id: m.actMediaId ?? String(idx),
                name: "media",
                size: "0",
                preview: m.url,
                type: m.type,
              })),
            }}
            onDeleteSuccess={async () => {
              setTimeout(async () => {
                await revalidateDiscovery();
                queryClient.invalidateQueries({ queryKey: ["feed"] });
                queryClient.invalidateQueries({ queryKey: ["gallery"] });
                startTransition(() => {
                  router.refresh();
                });
              }, 800);
            }}
            onUpdateSuccess={async (updatedData) => {
              setActualPost((prev) => ({
                ...prev,
                content: updatedData.content,
                location: updatedData.location,
                tags: updatedData.tags,
              }));
              setTimeout(async () => {
                await revalidateDiscovery();
                queryClient.invalidateQueries({ queryKey: ["feed"] });
                queryClient.invalidateQueries({ queryKey: ["gallery"] });
                startTransition(() => {
                  router.refresh();
                });
              }, 800);
            }}
          />
        </div>
      </div>

      {content && (
        <div className="px-4 flex flex-col gap-1.5">
          <p className="text-sm text-(--text-secondary) font-inter break-words whitespace-pre-wrap">
            {isCaptionLong && !captionExpanded
              ? content.slice(0, CAPTION_LIMIT) + "... "
              : content}

            {isCaptionLong && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCaptionExpanded(!captionExpanded);
                }}
                className="text-(--secondary-color) font-medium hover:underline ml-1 cursor-pointer"
              >
                {captionExpanded ? "show less" : "view more"}
              </button>
            )}
          </p>

          <div className="flex flex-wrap gap-2 pb-2">
            {tags &&
              tags.length > 0 &&
              tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-sm font-medium text-(--main-color) break-all cursor-text"
                  onClick={(e) => e.stopPropagation()}
                >
                  #{tag}
                </span>
              ))}
          </div>
        </div>
      )}
      {media && media.length > 0 && (
        <div onClick={handleCardClick} className="cursor-pointer px-4 mb-4">
          <div className="rounded-lg overflow-hidden h-56 sm:h-80 md:h-125 bg-black/5">
            <ActivityCarousal
              media={media}
              activitiesId={activitiesId}
              activityType={activity.type === "video" ? "video" : "image"}
              priority={index === 0}
            />
          </div>
        </div>
      )}
      {linkedEvent && (
        <div className="w-full pl-3 pb-3">
          <Link
            href={`/events/${linkedEvent.eventId}`}
            className="px-2.5 text-(--main-color) py-1.5 m-1 gap-1.5 inline-flex bg-background rounded-md overflow-hidden hover:opacity-90 transition-opacity"
          >
            <Note
              size={20}
              color="currentColor"
              className="text-(--main-color)"
            />
            <span className="text-center text-sm font-semibold">
              {linkedEvent.eventTitle}
            </span>
          </Link>
        </div>
      )}
      {/* {(!media || media.length === 0) && (
        <div className="px-4 pb-2">
          <Link
            href={`/posts/${activitiesId}`}
            className="text-sm text-(--main-color) font-medium hover:underline inline-flex items-center gap-1"
          >
            View post →
          </Link>
        </div>
      )} */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between border-t border-(--input-border) pt-4 gap-2">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={handleLike}
              className="group flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Heart
                size={22}
                color={actualPost.isLiked ? "#FF0000" : "#1D2939"}
                variant={actualPost.isLiked ? "Bold" : "Linear"}
                className="transition-all duration-200 ease-out group-hover:scale-125 group-active:scale-95"
              />
              <span className="text-sm font-semibold text-slate-800 select-none">
                {formatCount(actualPost.likes)}
              </span>
            </button>
            <Link
              href={`/posts/${activitiesId}`}
              className="flex items-center gap-2 cursor-pointer shrink-0"
            >
              <MessageText1 variant="Linear" size={22} color="#1D2939" />
              <span className="text-sm font-semibold text-slate-800 select-none">
                {formatCount(commentsCount)}
                <span className="hidden sm:inline"> comments</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setOpenShare(true)}
              className="group flex items-center gap-2 cursor-pointer"
            >
              <Send
                size={22}
                color="#1D2939"
                variant="Linear"
                className="transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:-rotate-45"
              />
              <span className="text-sm font-semibold text-slate-800 select-none">
                Share
              </span>
            </button>
          </div>
        </div>
      </div>
      <ShareModal
        isOpen={openShare}
        onClose={() => setOpenShare(false)}
        shareUrl={shareUrl}
      />
    </article>
  );
});
