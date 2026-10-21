"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  ArrowRight2,
  Calendar,
  Edit2,
  Send,
  Heart,
  Location,
  More,
  Trash,
} from "iconsax-react";
import Link from "next/link";
import SharePopup from "@/components/discovery/SharePopup";
import { getCategoryConfig } from "@/constant/category.config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { resolveUrl } from "@/lib/format";
import { toggleLikeAction } from "@/actions/event.actions";
import { eventUrl } from "@/lib/url";

export interface EventProps {
  id: string | number;
  title: string;
  location: string;
  price: string | number | null | undefined;
  rating: number;
  date: string;
  category: string;
  description: string;
  image: string;
  isLiked?: boolean;
}

export default function EventCard({
  id,
  title,
  location,
  price,
  rating,
  date,
  category,
  description,
  image,
  isLiked,
  onDelete,
  onEdit,
  detailsHref,
  enableShareModal = false,
  showDetailsLink = true,
  onNavigate,
}: EventProps & {
  onDelete?: () => void;
  onEdit?: () => void;
  detailsHref?: string;
  enableShareModal?: boolean;
  showDetailsLink?: boolean;
  onNavigate?: () => void;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(isLiked ?? false);

  useEffect(() => {
    const handleStorage = () => {
      try {
        const cached = localStorage.getItem(`event_like_${id}`);
        if (cached !== null) {
          setIsFavorite(cached === "true");
        }
      } catch (e) {}
    };

    handleStorage(); // Initial sync
    window.addEventListener("storage", handleStorage);
    window.addEventListener("like_sync", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("like_sync", handleStorage);
    };
  }, [id, isLiked]);

  const handleLikeToggle = async () => {
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    try {
      localStorage.setItem(`event_like_${id}`, String(nextState));
      window.dispatchEvent(new Event("like_sync"));
    } catch (e) {}

    const result = await toggleLikeAction(id.toString());
    if (result && "error" in result) {
      setIsFavorite(!nextState);
      try {
        localStorage.setItem(`event_like_${id}`, String(!nextState));
        window.dispatchEvent(new Event("like_sync"));
      } catch (e) {}
    }
  };

  const { key: categoryKey, config: categoryConfig } =
    getCategoryConfig(category);
  const CategoryIcon = categoryConfig.icon;

  const priceLabel =
    typeof price === "number"
      ? price === 0
        ? "FREE"
        : `$${price.toFixed(2)}`
      : typeof price === "string"
        ? price.trim() || "FREE"
        : "FREE";

  const isFree =
    (typeof price === "number" && price === 0) ||
    priceLabel.toUpperCase() === "FREE";

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group mx-auto">
      {enableShareModal && (
        <SharePopup
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          shareUrl={eventUrl(String(id))}
        />
      )}
      <div className="relative w-full aspect-4/3 min-h-62.5 bg-gray-200 overflow-hidden shrink-0">
        <Image
          src={resolveUrl(image)}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          width={800}
          height={250}
          // fill
        />

        <div className="absolute top-3 left-3 bg-(--secondary-color) backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-regular flex items-center gap-1.5 text-white w-max max-w-[calc(100%-100px)]">
          <Location size={16} color="currentColor" className="text-gray-200" />{" "}
          {location}
        </div>

        <div
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm ${
            isFree
              ? "bg-[#E8F7FA] main-color"
              : "bg-[#ffeaf0] text-(--accent-color)"
          }`}
        >
          {priceLabel}
        </div>

        <div className="absolute bottom-3 left-4 text-white z-10 max-w-[70%]">
          <h3 className="text-lg font-bold drop-shadow-md truncate">{title}</h3>
        </div>

        <div className="absolute bottom-3 right-4 bg-white/20 backdrop-blur-md border border-white/20 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 z-10 w-max">
          {rating}
          <Image
            src="/images/YellowStarIcon.svg"
            alt="Star"
            width={12}
            height={12}
          />
        </div>

        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2 text-[#475467] text-sm font-medium">
            <Calendar size={24} color="currentColor" className="main-color" />{" "}
            {date}
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-black hover:text-gray-600 transition cursor-pointer outline-none focus:outline-none focus-visible:outline-none border-none">
                  <More size={24} color="currentColor" className="rotate-90" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                {id && (
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    {onEdit ? (
                      <button
                        onClick={onEdit}
                        className="w-full flex items-center gap-2 outline-none"
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                    ) : (
                      <Link
                        href={`/organizer/events/${id}/edit`}
                        className="w-full flex items-center gap-2 outline-none"
                      >
                        <Edit2 size={16} /> Edit
                      </Link>
                    )}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onSelect={() => onDelete && onDelete()}
                >
                  <div className="flex items-center gap-2">
                    <Trash size={16} /> Delete
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full w-max mb-3 tracking-widest uppercase shrink-0 border"
          style={{
            borderColor: categoryConfig.color,
            color: categoryConfig.color,
            backgroundColor: categoryConfig.bg,
          }}
        >
          <CategoryIcon size={12} />
          {categoryKey}
        </span>

        <p
          className="text-[#475467] text-base font-regular flex-1 leading-relaxed mt-0"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {description}
        </p>

        <div className="flex items-center justify-between mt-4 shrink-0 pt-3 border-t border-gray-100">
          <div className="flex gap-4 text-gray-400">
            <button
              onClick={handleLikeToggle}
              aria-pressed={isFavorite}
              className="group/like transition p-1 cursor-pointer"
            >
              <Heart
                size={22}
                color={isFavorite ? "#FF0000" : "#1D2939"}
                variant={isFavorite ? "Bold" : "Linear"}
                className="transition-all duration-200 ease-out group-hover/like:scale-125 group-active/like:scale-95"
              />
            </button>
            <button
              type="button"
              onClick={() => enableShareModal && setShareOpen(true)}
              className="group/share transition p-1 cursor-pointer"
              aria-label="Share event"
            >
              <Send
                size={22}
                color="#1D2939"
                variant="Linear"
                className="transition-all duration-300 ease-out group-hover/share:-translate-y-1 group-hover/share:translate-x-1 group-hover/share:-rotate-45"
              />
            </button>
          </div>
          {showDetailsLink ? (
            <Link
              href={detailsHref || `/events/${id}`}
              onClick={onNavigate}
              className="text-xs font-regular text-gray-700 flex items-center gap-0.5 hover:text-(--main-color) transition-opacity"
            >
              View Details <ArrowRight2 size={12} color="currentColor" />
            </Link>
          ) : (
            <span className="text-xs font-regular text-gray-700 flex items-center gap-0.5 cursor-default select-none">
              View Details <ArrowRight2 size={12} color="currentColor" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
