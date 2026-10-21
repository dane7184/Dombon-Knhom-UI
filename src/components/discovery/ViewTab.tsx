"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import React, { useTransition } from "react";

export default function ViewTab() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [, startTransition] = useTransition();

  const isFeedActive = pathname === "/discovery";
  const isGridActive = pathname === "/discovery/grid";

  const handleFeedClick = (e: React.MouseEvent) => {
    if (isFeedActive) {
      // Prevent <Link> from also navigating to /discovery. Without this, the
      // Link navigation (high-priority) interrupts our startTransition
      // (low-priority), React restarts the transition, and router.refresh()
      // fires 3-4 times instead of once.
      e.preventDefault();
      startTransition(() => {
        router.refresh();
      });
      document
        .getElementById("feed-scroll-container")
        ?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGalleryClick = (e: React.MouseEvent) => {
    if (isGridActive) {
      // Same reason: prevent duplicate navigation while we reset the query.
      e.preventDefault();
      queryClient.resetQueries({ queryKey: ["gallery"] });
      document
        .getElementById("gallery-scroll-container")
        ?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const feedClass = isFeedActive
    ? "w-1/2 py-3 rounded-lg bg-main text-[var(--btn-text)] flex items-center justify-center gap-2 text-sm font-bold shadow-sm transition-all cursor-pointer"
    : "w-1/2 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--background-gray)] transition-all cursor-pointer";

  const galleryClass = isGridActive
    ? "w-1/2 py-3 rounded-lg bg-main text-[var(--btn-text)] flex items-center justify-center gap-2 text-sm font-bold shadow-sm transition-all cursor-pointer"
    : "w-1/2 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--background-gray)] transition-all cursor-pointer";

  return (
    <div className="w-full mx-auto">
      <div className="w-full bg-[var(--background-white)] p-1.5 rounded-xl flex items-center justify-between shadow-xs">
        <Link href="/discovery" onClick={handleFeedClick} className={feedClass}>
          <svg
            className={`w-4 h-4 ${!isFeedActive ? "main-color" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <g clipPath="url(#clip0_feed_icon)">
              <path
                d="M9.02 2.84016L3.63 7.04016C2.73 7.74016 2 9.23016 2 10.3602V17.7702C2 20.0902 3.89 21.9902 6.21 21.9902H17.79C20.11 21.9902 22 20.0902 22 17.7802V10.5002C22 9.29016 21.19 7.74016 20.2 7.05016L14.02 2.72016C12.62 1.74016 10.37 1.79016 9.02 2.84016Z"
                stroke={isFeedActive ? "#fff" : "currentColor"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 17.9902V14.9902"
                stroke={isFeedActive ? "#fff" : "currentColor"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_feed_icon">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span className={`font-inter ${!isFeedActive ? "main-color" : ""}`}>
            Feed
          </span>
        </Link>

        <Link
          href="/discovery/grid"
          onClick={handleGalleryClick}
          className={galleryClass}
        >
          <svg
            className={`w-4 h-4 ${!isGridActive ? "main-color" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <g clipPath="url(#clip0_gallery_icon)">
              <path
                d="M22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15Z"
                stroke={isGridActive ? "#fff" : "currentColor"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.52002 7.11035H21.48"
                stroke={isGridActive ? "#fff" : "currentColor"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.52002 2.11035V6.97035"
                stroke={isGridActive ? "#fff" : "currentColor"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.48 2.11035V6.52035"
                stroke={isGridActive ? "#fff" : "currentColor"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.75 14.4501V13.2501C9.75 11.7101 10.84 11.0801 12.17 11.8501L13.21 12.4501L14.25 13.0501C15.58 13.8201 15.58 15.0801 14.25 15.8501L13.21 16.4501L12.17 17.0501C10.84 17.8201 9.75 17.1901 9.75 15.6501V14.4501V14.4501Z"
                stroke={isGridActive ? "#fff" : "currentColor"}
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_gallery_icon">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span className={`font-inter ${!isGridActive ? "main-color" : ""}`}>
            <span className="hidden sm:inline">Gallery View</span>
            <span className="sm:hidden">Gallery</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
