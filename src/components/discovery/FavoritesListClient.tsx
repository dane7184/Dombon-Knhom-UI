"use client";

import React, { useMemo, useState } from "react";
import { ArrowRight2 } from "iconsax-react";
import Link from "next/link";
import { FavoriteItem } from "@/types/favorite.type";
import { resolveUrl } from "@/lib/format";
import Image from "next/image";

interface FavoritesListClientProps {
  favorites: FavoriteItem[];
}

export default function FavoritesListClient({
  favorites,
}: FavoritesListClientProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const initialVisibleCount = 5;

  const validFavorites = useMemo(
    () => favorites.filter((user) => user.name && user.image),
    [favorites]
  );

  const visibleFavorites = useMemo(
    () => (isExpanded ? validFavorites : validFavorites.slice(0, initialVisibleCount)),
    [isExpanded, validFavorites],
  );

  const canExpand = validFavorites.length > initialVisibleCount;

  if (validFavorites.length === 0) {
    return (
      <aside className="w-full flex flex-col gap-3 bg-[var(--background-white)] p-5 rounded-xl card-shadow border border-[var(--input-border)]">
        <h3 className="text-sm font-bold text-[var(--text-main)] tracking-tight">
          Favorites
        </h3>
        <p className="text-xs text-[var(--text-secondary)] py-2">
          No favorites found.
        </p>
      </aside>
    );
  }

  return (
    <aside className="w-full flex flex-col gap-3 bg-[var(--background-white)] p-5 rounded-xl card-shadow border border-[var(--input-border)]">
      <div className="flex justify-between items-center w-full">
        <h3 className="text-sm font-bold text-[var(--text-main)] tracking-tight">
          Favorites
        </h3>
      </div>
      <nav
        className={`flex flex-col gap-3 ${isExpanded ? "max-h-[500px] overflow-y-auto pr-1" : ""}[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}
      >
        {visibleFavorites.map((item, index) => {
          const isUser = item.entityType === "User";

          const hrefPath = `/profile/${item.entityId}`;

          const displayName = item.name;

          return (
            <Link
              href={hrefPath}
              key={item.bookmarkId || `${item.entityId}-${index}`}
              className="flex items-center gap-3 group cursor-pointer p-1 rounded-lg hover:bg-[var(--background-gray)] transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--background-gray)] overflow-hidden flex-shrink-0 border border-[var(--input-border)] shadow-sm">
                <Image
                  src={resolveUrl(item.image)}
                  alt={item.name ?? "Some image"}
                  className="object-cover"
                  width={50}
                  height={50}
                />
              </div>
              <div className="flex flex-col min-w-0 justify-center">
                <div className="text-sm font-semibold text-[var(--text-main)] truncate group-hover:text-[var(--main-color)] transition-colors duration-200 leading-snug">
                  {displayName}
                  {!isUser && (
                    <span className="ms-1">
                      <img
                        src="/images/Verified.svg"
                        alt="Verified Organizer"
                        width={14}
                        height={14}
                        className="inline-block mb-1"
                      />
                    </span>
                  )}
                </div>

                <span className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                  {isUser ? "User Profile" : "Organizer"}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
      {canExpand ? (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="text-xs sm:text-sm font-semibold text-gray-700 flex justify-center items-center gap-1 hover:text-[var(--main-color)] transition group mt-1 pt-3 border-t border-[var(--input-border)] w-full cursor-pointer"
        >
          <span>{isExpanded ? "See less" : "See more"}</span>
          <ArrowRight2
            size={12}
            color="currentColor"
            className={`transition-transform duration-300 ${isExpanded ? "-rotate-90 group-hover:-translate-y-0.5" : "rotate-90 group-hover:translate-y-0.5"}`}
          />
        </button>
      ) : null}
    </aside>
  );
}
