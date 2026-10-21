"use client";

import Image from "next/image";
import { ArrowRight2, Calendar, Edit2, ExportCurve, Heart, Location, More, Star, Trash, Profile2User } from "iconsax-react";
import { showToast } from "@/lib/myToast";
import { Bookmark } from "lucide-react";
import { useSession } from "next-auth/react";
import { deleteEvent, toggleLikeEvent, toggleSaveEvent, } from "@/services/profileInfo.service";
import { EventProfileRespone } from "@/types/event.type";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import SharePopup from "@/components/discovery/SharePopup";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { getCategoryConfig } from "@/constant/category.config";
import { BaseModal } from "@/components/profile/BaseModal";
import { formatDate, resolveUrl } from "@/lib/format";
import { useSwitchMode } from "@/hooks/useSwitchMode";

type EventCardComponentProps = EventProfileRespone & {
  onDelete?: () => void;
  onSaved?: () => void;
  onUnsave?: (eventId: string) => void;
  isCurrentUser?: boolean;
  currentUserOrgId?: string | null;
  isOrgProfile?: boolean;
};

const EventCardComponent = ({
  eventId,
  title,
  province,
  price,
  description,
  image,
  startAt,
  endAt,
  categoryName,
  rating,
  isLiked,
  status,
  isSaved,
  isCurrentUser = false,
  currentUserOrgId,
  isOrgProfile = false,
  onDelete,
  onUnsave }: EventCardComponentProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { switchToOrg, isSwitching } = useSwitchMode();

  const [liked, setLiked] = useState(isLiked);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [saved, setSaved] = useState(isSaved);

  const handleEditClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOrgProfile) {
      if (currentUserOrgId && session?.user?.role === "Organizer" && !session.user.orgId) {
        await switchToOrg(currentUserOrgId, `/organizer/events/${eventId}/edit`);
      } else {
        router.push(`/organizer/events/${eventId}/edit`);
      }
    } else {
      router.push(`/events/${eventId}/edit`);
    }
  };

  const handleDelete = async () => {
    const token = session?.user?.accessToken;
    if (!token) return;

    try {
      await deleteEvent(eventId, token);
      onDelete?.();
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const match = message.match(/"detail":"([^"]+)"/);
      showToast("error", {
        description: match ? match[1] : "Failed to delete event",
      });
    }
  };

  // Liked or unlike event
  const [isLiking, setIsLiking] = useState(false);
  const handleToggleLike = async () => {
    const token = session?.user?.accessToken;
    if (!token || isLiking) return;

    setLiked((prev) => !prev);
    setIsLiking(true);

    try {
      await toggleLikeEvent(eventId, token);
    } catch (error) {
      setLiked((prev) => !prev);
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  // toggle saved event
  const handleToggleSave = async () => {
    const token = session?.user?.accessToken;
    if (!token) return;

    const wasSaved = saved;
    setSaved((prev) => !prev);
    // Toast immediately (optimistic); revert + error toast only if it fails.
    showToast(wasSaved ? "deleteSuccess" : "success", {
      description: wasSaved
        ? "Event removed from saved"
        : "Event saved successfully",
    });

    try {
      await toggleSaveEvent(eventId, token);
      if (wasSaved) {
        onUnsave?.(eventId);
      }
    } catch (err) {
      setSaved((prev) => !prev);
      showToast("error", { description: "Failed to save event." });
      console.error("Failed to toggle save:", err);
    }
  };

  // category config
  const { config } = getCategoryConfig(categoryName);
  const CategoryIcon = config.icon;

  return (
    <>
      <div className="w-full bg-white rounded-[12px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-gray-50/50">
        {/* ── Image block ── */}
        <div className="relative w-full aspect-16/10 sm:aspect-video overflow-hidden shrink-0 bg-slate-100">
          <Image
            src={resolveUrl(image)}
            alt={title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition duration-500"
            fill
          />

          {/* Location badge */}
          <div className="absolute top-3 left-3 bg-(--secondary-color) backdrop-blur-md px-3 py-1.5 rounded-full text-xs sm:text-sm font-normal flex items-center gap-1.5 text-white z-10">
            <Location
              size={16}
              color="currentColor"
              className="text-gray-200 shrink-0"
            />
            <span className="truncate max-w-25 sm:max-w-37.5">{province?.replace(/_/g, ' ')}</span>
          </div>

          {/* Price badge */}
          <div
            className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm z-10 ${price == null || price === 0
              ? "bg-[#E8F7FA] main-color"
              : "bg-[#ffeaf0] text-(--accent-color)"
              }`}
          >
            {price == null || price === 0 ? "FREE" : `$${price.toFixed(2)}`}
          </div>

          {/* Title + rating on image */}
          <div className="absolute bottom-3 left-4 right-4 text-white z-10 flex items-end justify-between gap-2">
            <h3 className="text-base sm:text-lg md:text-xl font-bold drop-shadow-md line-clamp-1 flex-1">
              {title}
            </h3>
            {status === "Published" && (
              <span className="flex items-center shrink-0 text-white text-xs font-medium py-1 px-2.5 backdrop-blur-lg bg-white/30 border border-white/30 rounded-xl">
                <Star
                  variant="Bold"
                  size={14}
                  className="inline mr-1"
                  color="#FFD700"
                />
                {rating}
              </span>
            )}
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none z-0" />
        </div>

        {/* ── Body block ── */}
        <div className="px-4 py-3 flex-1 flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            {/* Date row + bookmark / more menu */}
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-[#475467] text-xs sm:text-sm font-medium">
                <Calendar
                  size={20}
                  color="currentColor"
                  className="main-color shrink-0"
                />
                <span>
                  Date: {formatDate(startAt)} - {formatDate(endAt)}
                </span>
              </div>

              {isCurrentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="text-black hover:text-gray-600 transition p-1 cursor-pointer"
                    >
                      <More
                        size={18}
                        className="rotate-90 translate-x-2.5"
                        color="currentColor"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-36">

                    <DropdownMenuItem asChild>
                      <button
                        onClick={handleEditClick}
                        disabled={isSwitching}
                        className="cursor-pointer flex w-full items-center gap-2 outline-none"
                      >
                        <Edit2 size={16} />
                        {isSwitching ? "Switching Mode..." : "Edit"}
                      </button>
                    </DropdownMenuItem>
                    <BaseModal
                      variant="deleteEvent"
                      descriptionValues={{ eventTitle: title }}
                      onConfirm={handleDelete}
                    >
                      <DropdownMenuItem
                        variant="destructive"
                        className="cursor-pointer flex items-center gap-2"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash size={16} />
                        Delete
                      </DropdownMenuItem>
                    </BaseModal>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleSave}
                  aria-pressed={saved}
                  className="text-black hover:text-gray-600 transition p-1 cursor-pointer"
                >
                  <Bookmark
                    size={25}
                    color={saved ? "#FDB022" : "#475467"}
                    fill={saved ? "#FDB022" : "none"}
                  />
                </button>
              )}
            </div>

            {/* Category pill */}
            <div>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 border text-[10px] font-bold rounded-full tracking-widest uppercase shrink-0"
                style={{
                  backgroundColor: config.bg,
                  borderColor: config.color,
                  color: config.color,
                }}
              >
                <CategoryIcon size={12} strokeWidth={2.5} />
                {categoryName}
              </span>
            </div>

            {/* Description */}
            <p className="text-[#475467] line-clamp-2 text-sm font-normal leading-relaxed">
              {description}
            </p>
          </div>

          {/* ── Footer: like / share / view details ── */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 shrink-0">
            <div className="flex gap-4 text-gray-400">
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={isLiking}
                aria-pressed={liked}
                aria-label={liked ? "Unlike event" : "Like event"}
                className="hover:text-(--accent-color) transition p-1 cursor-pointer disabled:opacity-60"
              >
                <Heart
                  size={22}
                  color={liked ? "#EF4444" : "currentColor"}
                  variant={liked ? "Bold" : "Linear"}
                />
              </button>
              <button
                onClick={() => setIsShareOpen(true)}
                className="hover:text-(--main-color) transition p-1 cursor-pointer"
              >
                <ExportCurve size={22} color="currentColor" />
              </button>
            </div>

            <Link
              href={`/events/${eventId}`}
              className="text-xs sm:text-sm font-normal text-gray-700 flex items-center gap-1 hover:text-(--main-color) transition group-hover:text-(--main-color)"
            >
              <span>View Details</span>
              <ArrowRight2
                size={12}
                color="currentColor"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>

      <SharePopup
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        shareUrl={`https://dombon.design/events/${eventId}`}
      />
    </>
  );
};

export default EventCardComponent;
