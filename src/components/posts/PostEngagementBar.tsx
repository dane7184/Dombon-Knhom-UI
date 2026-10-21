"use client";
import React, { useEffect, useState, useRef } from "react";
import "@/app/globals.css";
import { Heart, More, Send, MessageText1 } from "iconsax-react";
import { MappedPostDetail, toggleLikeActivity } from "@/services/activity.service";
import SharePopup from "@/components/discovery/SharePopup";
import ReportModal from "@/components/modals/ReportModal";
import { formatCount } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { PostDetail } from "@/types/activity.type";
import { postUrl } from "@/lib/url";
import { showToast } from "@/lib/myToast";
import { useDebounce } from "@/hooks/useDebounce";
interface PostDetailProps {
  post: MappedPostDetail | PostDetail;
}

export const PostEngagementBar = ({ post }: PostDetailProps) => {
  const { totalLikes, isLiked, totalComments } = post;
  const { user, isOrgMode } = useAuth();
  const isOwner = isOrgMode
    ? Boolean(user?.orgId && user.orgId === post.postUser?.posterId)
    : Boolean(user?.userId && user.userId === post.postUser?.posterId);
  const [isOpen, setIsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSaved, setIsSaved] = useState<boolean>(post.isSaved ?? false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const currentEventId = "12345";
  const [likeState, setLikeState] = useState({
    liked: isLiked,
    likesCount: totalLikes,
  });

  const handleLikeToggle = () => {
    setLikeState((currentState) => ({
      liked: !currentState.liked,
      likesCount: currentState.likesCount + (currentState.liked ? -1 : 1),
    }));
  };

  // ── Like debounce ─────────────────────────────────────────────
  const prevDebouncedLike = useRef(likeState.liked);
  const debouncedLike = useDebounce(likeState.liked, 500);

  useEffect(() => {
    if (debouncedLike === prevDebouncedLike.current) return;
    prevDebouncedLike.current = debouncedLike;
    toggleLikeActivity(post.postId).catch((err) => {
      console.error("Failed to toggle like:", err);
      // rollback state
      setLikeState((currentState) => ({
        liked: !debouncedLike,
        likesCount: currentState.likesCount + (!debouncedLike ? 1 : -1),
      }));
    });
  }, [debouncedLike, post.postId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between gap-2 mt-4">
        <div className="flex items-center gap-6 min-w-0">
          <button
            type="button"
            onClick={handleLikeToggle}
            className="group flex items-center gap-2 cursor-pointer"
          >
            <Heart
              size={22}
              color={likeState.liked ? "#FF0000" : "#1D2939"}
              variant={likeState.liked ? "Bold" : "Linear"}
              className="transition-all duration-200 ease-out group-hover:scale-125 group-active:scale-95"
            />
            <span className="text-sm font-semibold text-slate-800 select-none whitespace-nowrap">
              {formatCount(likeState.likesCount)}
              <span className="hidden md:inline">
                {" "}
                {likeState.likesCount === 1 ? "Like" : "Likes"}
              </span>
            </span>
          </button>

          <div className="flex items-center gap-2 cursor-pointer">
            <MessageText1 size={22} color="#1D2939" variant="Linear" />
            <span className="text-sm font-semibold text-slate-800 select-none whitespace-nowrap">
              {formatCount(totalComments)}
              <span className="hidden md:inline">
                {" "}
                {totalComments === 1 ? "Comment" : "Comments"}
              </span>
            </span>
          </div>

          <button
            onClick={() => setIsShareOpen(true)}
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
        <div className="relative" ref={wrapperRef}>
          <ReportModal
            postOwnerId={post.postUser?.posterId}
            contentType="post"
            contentId={post.postId}
            isOwner={isOwner}
            isSaved={isSaved}
            showSaveInDropdown={true}
            onToggleSave={async () => {
              const next = !isSaved;
              setIsSaved(next);
              showToast(next ? "success" : "deleteSuccess", {
                description: next
                  ? "Post saved successfully"
                  : "Post removed from saved",
              });
              const { toggleSavedActivity } =
                await import("@/services/activity.service");
              try {
                await toggleSavedActivity(post.postId);
              } catch {
                setIsSaved(!next);
                showToast("error", { description: "Failed to save post." });
              }
            }}
            onDeleteSuccess={() => {
              window.location.href = "/discovery";
            }}
            onUpdateSuccess={async () => {
              const { useRouter } = await import("next/navigation");
              setTimeout(() => {
                window.location.reload();
              }, 800);
            }}
            initialData={{
              activityId: post.postId,
              content: post.postDescription,
              tags: post.postUser?.tags || [],
              location: post.postLocation || post.likedEvent?.location || "",
              event: post.likedEvent?.eventId || "",
              files: (post as MappedPostDetail).postMedia
                ? (post as MappedPostDetail).postMedia!.map((m, idx) => ({
                    id: m.actMediaId ?? String(idx),
                    name: "attachment",
                    size: "0",
                    preview: m.url,
                    type: m.type?.toLowerCase() === "video" ? "video" : "image",
                  }))
                : post.postContent.map((src, idx) => ({
                    id: String(idx),
                    name: "attachment",
                    size: "0",
                    preview: src,
                    type:
                      post.postType?.toLowerCase() === "video"
                        ? "video"
                        : "image",
                  })),
            }}
          />
        </div>

        <SharePopup
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          shareUrl={postUrl(post.postId)}
        />
      </div>
    </>
  );
};
