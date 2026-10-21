"use client";
import React, { useState, useTransition } from "react";
import "@/app/globals.css";
import { Heart } from "iconsax-react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { PostDetail } from "@/types/activity.type";
import { resolveAvatarUrl } from "@/lib/format";
import {
  toggleFavoriteUser,
  toggleOrgFavoriteUser,
} from "@/services/profileInfo.service";
import { showToast } from "@/lib/myToast";

interface PostDetailProps {
  post: PostDetail;
  showBackButton?: boolean;
}

export const UserPostComponent = ({
  post,
  showBackButton,
}: PostDetailProps) => {
  const { postUser, postDescription } = post;
  const [isFavorite, setIsFavorite] = useState(postUser.isFavorite);
  const [transition, startTransition] = useTransition();
  const { user, isOrgMode, accessToken } = useAuth();
  const router = useRouter();
  const isOwner = isOrgMode
    ? Boolean(user?.orgId && user.orgId === postUser.posterId)
    : Boolean(user?.userId && user.userId === postUser.posterId);

  const handleToggleFavorite = () => {
    const nextState = !isFavorite;
    startTransition(async () => {
      setIsFavorite(nextState);
      showToast(nextState ? "success" : "deleteSuccess", {
        description: nextState
          ? "Added to favorites"
          : "Removed from favorites",
      });
      try {
        // Both services throw on a non-2xx response, handled below.
        if (postUser.isOrganizer) {
          await toggleOrgFavoriteUser(postUser.posterId, accessToken ?? "");
        } else {
          await toggleFavoriteUser(postUser.posterId, accessToken ?? "");
        }
      } catch {
        setIsFavorite(!nextState);
        showToast("error", { description: "Failed to update favorite." });
      }
    });
  };

  const resolvedSrc = resolveAvatarUrl(postUser.posterImage);

  return (
    <div className="w-full p-5 flex flex-col gap-4 bg-(--background-white) rounded-[15px] box-shadow">
      {/* Mobile header */}
      <div className="flex md:hidden items-center gap-3">
        {showBackButton && (
          <button
            type="button"
            onClick={() => router.back()}
            className="shrink-0 w-9 h-9 -ml-2 cursor-pointer flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors border-none bg-transparent"
          >
            <ArrowLeft size={22} color="#18ABC6" />
          </button>
        )}

        <Link
          href={`/profile/${postUser.posterId}`}
          className="shrink-0 relative w-11 h-11"
        >
          <Image
            src={resolvedSrc}
            alt={postUser.fullName ?? "no alt"}
            width={44}
            height={44}
            unoptimized={
              resolvedSrc.startsWith("/api/media-proxy") ||
              resolvedSrc.startsWith("blob:") ||
              resolvedSrc.startsWith("data:")
            }
            className="w-11 h-11 rounded-full object-cover ring-2 ring-offset-1 ring-(--main-color)/30"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold flex items-center gap-1.5 text-(--secondary-color) min-w-0">
            <Link
              href={`/profile/${postUser.posterId}`}
              className="truncate block min-w-0 hover:underline"
            >
              {postUser.fullName}
            </Link>
            {postUser.isOrganizer && (
              <span className="inline-block shrink-0">
                <Image
                  src="/images/Verified.svg"
                  alt="Verified"
                  width={16}
                  height={16}
                  className="inline-block"
                />
              </span>
            )}
          </h3>
          {/* <p className="text-xs text-gray-400">{postUser.datePosted}</p> */}
          {!isOwner && (
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`mt-1 flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
                isFavorite
                  ? "bg-(--accent-color)/5 text-(--accent-color) border-(--accent-color)/30"
                  : "bg-(--main-color)/5 text-(--main-color) border-(--main-color)/30"
              }`}
            >
              <Heart
                size={12}
                color={isFavorite ? "#fd346e" : "#18abc6"}
                variant={isFavorite ? "Bold" : "Linear"}
              />
              {isFavorite ? "Favorited" : "Favorite"}
            </button>
          )}
        </div>
      </div>

      {/* Desktop header — original layout */}
      <div className="hidden md:flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <Link
            href={`/profile/${postUser.posterId}`}
            className="shrink-0 relative w-14 h-14 mr-3"
          >
            <Image
              src={resolvedSrc}
              alt={postUser.fullName ?? "no alt"}
              fill
              unoptimized={
                resolvedSrc.startsWith("/api/media-proxy") ||
                resolvedSrc.startsWith("blob:") ||
                resolvedSrc.startsWith("data:")
              }
              className="object-cover rounded-full"
            />
          </Link>
          <div className="min-w-0">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-(--secondary-color) min-w-0">
              <Link
                href={`/profile/${postUser.posterId}`}
                className="truncate block min-w-0"
              >
                {postUser.fullName}
              </Link>
              {postUser.isOrganizer && (
                <span className="relative w-4 h-4 shrink-0 inline-block">
                  <Image src="/images/Verified.svg" alt="Verified" fill />
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500">{postUser.datePosted}</p>
          </div>
        </div>
        {!isOwner && (
          <button
            type="button"
            className={`${isFavorite ? "btn-accent" : "btn-main"} flex items-center cursor-pointer shrink-0`}
            onClick={handleToggleFavorite}
          >
            <Heart
              size={20}
              color="#FFFFFF"
              variant={isFavorite ? "Bold" : "Outline"}
            />
            <span className="ml-2">
              {isFavorite ? "Favorited" : "Favorite"}
            </span>
          </button>
        )}
      </div>

      <div className="text-slate-800 text-md whitespace-pre-wrap wrap-break-words">
        {postDescription}
      </div>

      {postUser.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 text-(--main-color) text-md font-medium">
          {postUser.tags.map((tag, index) => (
            <span
              key={index}
              className="break-all cursor-text"
              onClick={(e) => e.stopPropagation()}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
