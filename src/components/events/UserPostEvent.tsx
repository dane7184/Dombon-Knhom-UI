"use client";

import React, { useState } from "react";
import "@/app/globals.css";
import { Heart } from "iconsax-react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { EventDetail, OrgProfile, UserProfile } from "@/types/event.type";
import {
  toggleFavoriteOrgAction,
  toggleFavoriteUserAction,
} from "@/actions/event.actions";
import { resolveAvatarUrl } from "@/lib/format";
import { useSession } from "next-auth/react";
import { showToast } from "@/lib/myToast";

interface UserPostEventProps {
  event: EventDetail;
  profile: OrgProfile | UserProfile | null;
  showBackButton?: boolean;
}

export const UserPostEvent = ({
  event,
  profile,
  showBackButton,
}: UserPostEventProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(profile?.isFavorite ?? false);

  const isOrg = !!event.organizerId;
  const profileId = isOrg ? event.organizerId : event.creatorId;

  const isOwnProfile = isOrg
    ? profileId === session?.user?.orgId
    : profileId === session?.user?.userId;

  const handleFavoriteToggle = async () => {
    const wasFavorite = isFavorite;
    const next = !wasFavorite;
    setIsFavorite(next);
    // Toast immediately (optimistic); revert + error toast only if it fails.
    showToast(next ? "success" : "deleteSuccess", {
      description: next ? "Added to favorites" : "Removed from favorites",
    });

    const result =
      isOrg && event.organizerId
        ? await toggleFavoriteOrgAction(event.organizerId)
        : event.creatorId
          ? await toggleFavoriteUserAction(event.creatorId)
          : {
              error: "No profile ID",
              message: "Unable to update favorite status.",
            };

    if ("error" in result) {
      setIsFavorite(wasFavorite);
      showToast("error", { description: "Failed to update favorite." });
    }
  };

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
          href={`/profile/${profileId}`}
          className="shrink-0 relative w-11 h-11"
        >
          <Image
            src={resolveAvatarUrl(profile?.avatarUrl)}
            alt={profile?.name ?? ""}
            className="object-cover rounded-full ring-2 ring-offset-1 ring-(--main-color)/30"
            fill
          />
        </Link>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold flex items-center gap-1.5 text-(--secondary-color) min-w-0">
            <Link
              href={`/profile/${profileId}`}
              className="truncate block min-w-0 hover:underline"
            >
              {profile?.name ?? "Loading..."}
            </Link>
            {isOrg && (
              <span className="relative w-4 h-4 shrink-0 inline-block">
                <Image
                  src="/images/Verified.svg"
                  alt="Verified Organizer"
                  fill
                />
              </span>
            )}
          </h3>
          {!isOwnProfile && (
            <button
              type="button"
              onClick={handleFavoriteToggle}
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
            href={`/profile/${profileId}`}
            className="shrink-0 relative w-14 h-14 mr-3"
          >
            <Image
              src={resolveAvatarUrl(profile?.avatarUrl)}
              alt={profile?.name ?? ""}
              className="object-cover rounded-full"
              fill
            />
          </Link>
          <div className="min-w-0">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-(--secondary-color) min-w-0">
              <Link
                href={`/profile/${profileId}`}
                className="truncate block min-w-0"
              >
                {profile?.name ?? "Loading..."}
              </Link>
              {isOrg && (
                <span className="relative w-4 h-4 shrink-0 inline-block">
                  <Image
                    src="/images/Verified.svg"
                    alt="Verified Organizer"
                    fill
                  />
                </span>
              )}
            </h3>
          </div>
        </div>
        {!isOwnProfile && (
          <button
            type="button"
            className={`${isFavorite ? "btn-accent" : "btn-main"} flex items-center cursor-pointer shrink-0`}
            onClick={handleFavoriteToggle}
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
        {event.description}
      </div>
    </div>
  );
};
