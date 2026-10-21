"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight2 } from "iconsax-react";
import { useNotifications, NotificationFilter } from "@/hooks/useNotifications";
import { NotificationConfig } from "@/constant/notification.config";
import {
  buildNotificationMessage,
  formatRelativeTime,
  isUnread,
  resolveNotificationPath,
} from "@/lib/notification.util";
import { NotificationItem } from "@/types/notification.type";
import { ArrowLeft } from "lucide-react";

export type UserRole = "user" | "organizer" | "moderator" | "admin";

interface NotificationPageProps {
  role: UserRole;
}

const STATUS_TABS: { label: string; value: NotificationFilter }[] = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
];

function NotificationRow({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: (id: string) => void;
}) {
  const router = useRouter();
  const config = NotificationConfig[item.notifiableType];
  const Icon = config.icon;
  const unread = isUnread(item);
  const segments = buildNotificationMessage(item);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = async () => {
    if (unread) onRead(item.notificationId);
    if (isNavigating) return;

    setIsNavigating(true);
    try {
      const path = await resolveNotificationPath(item);
      if (path) router.push(path);
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 border-b border-(--input-border) cursor-pointer transition-colors hover:bg-(--background-gray) group ${
        unread ? "bg-white" : "bg-(--background-white)"
      } ${isNavigating ? "opacity-60 pointer-events-none" : ""}`}
    >
      <div className="w-2 shrink-0 flex items-center justify-center">
        {unread && (
          <span className="w-2 h-2 rounded-full bg-(--main-color) shrink-0" />
        )}
      </div>

      <div
        className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ background: `${config.color}15` }}
      >
        <Icon size={16} color={config.color} />
      </div>

      <p className="flex-1 text-sm text-(--text-secondary) leading-relaxed min-w-0">
        {segments.map((seg, i) =>
          seg.bold ? (
            <span key={i} className="font-semibold text-(--secondary-color)">
              {seg.text}
            </span>
          ) : (
            <span key={i}>{seg.text}</span>
          ),
        )}
      </p>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {formatRelativeTime(item.createdAt)}
        </span>
        <ArrowRight2
          size={16}
          color="#94a3b8"
          className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
}

export default function NotificationPage({ role }: NotificationPageProps) {
  const {
    notifications,
    allCount,
    unreadCount,
    readCount,
    filter,
    setFilter,
    isLoading,
    isError,
    error,
    hasMore,
    isFetchingMore,
    loadMore,
    markAllRead,
    markRead,
  } = useNotifications();
  const isUser = role === "user";
  const counts: Record<NotificationFilter, number> = {
    all: allCount,
    unread: unreadCount,
    read: readCount,
  };
  const router = useRouter();
  return (
    <div className="bg-background h-fit overflow-hidden flex flex-col">
      <div className="w-full mx-auto flex flex-col flex-1 min-h-0">
        <div className="bg-(--background-white) rounded-2xl border border-(--input-border) card-shadow overflow-hidden flex flex-col flex-1 min-h-0">
          <div
            className={`flex flex-col md:flex-row md:items-center px-4 md:px-6 py-4 md:py-5 border-b border-(--input-border) shrink-0 gap-3 md:gap-0 ${
              isUser ? "md:justify-between" : "justify-start"
            }`}
          >
            {isUser && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="w-9 h-9 md:w-10 md:h-10 bg-white cursor-pointer flex items-center justify-center rounded-full shrink-0"
                >
                  <ArrowLeft size={20} color="#18ABC6" />
                </button>
                <h1 className="text-xl md:text-2xl font-bold text-(--secondary-color)">
                  Notifications
                </h1>
              </div>
            )}

            <div className="flex items-center gap-1 flex-wrap">
              {STATUS_TABS.map((tab) => {
                const count = counts[tab.value];
                const active = filter === tab.value;

                return (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value)}
                    className={`relative flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg cursor-pointer overflow-hidden transition-all duration-300 ease-out ${
                      active
                        ? "text-(--secondary-color)"
                        : "text-slate-400 hover:text-(--text-secondary)"
                    }`}
                  >
                    {/* subtle hover background */}
                    <span
                      className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                        active
                          ? "bg-(--main-color)/5"
                          : "bg-transparent hover:bg-slate-100/70"
                      }`}
                    />

                    {/* content */}
                    <span className="relative z-10">{tab.label}</span>

                    {count > 0 && (
                      <span
                        className={`relative z-10 text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center transition-all duration-300 ${
                          active
                            ? "bg-(--main-color) text-white scale-100"
                            : "bg-slate-100 text-slate-500 scale-95"
                        }`}
                      >
                        {count}
                      </span>
                    )}

                    {/* animated bottom indicator */}
                    <span
                      className={`absolute bottom-0 left-1/2 h-0.5 bg-(--main-color) rounded-full transition-all duration-300 ease-out ${
                        active
                          ? "w-[70%] -translate-x-1/2 opacity-100"
                          : "w-0 -translate-x-1/2 opacity-0"
                      }`}
                    />
                  </button>
                );
              })}

              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="ml-2 text-sm font-semibold text-(--main-color) hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 pb-24 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {isLoading && notifications.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-(--main-color) border-t-transparent rounded-full animate-spin" />
              </div>
            ) : isError ? (
              <div className="h-full flex items-center justify-center text-sm text-red-400">
                {error instanceof Error
                  ? error.message
                  : "Failed to load notifications"}
              </div>
            ) : notifications.length === 0 ? (
              <div className=" flex-1 h-full flex items-center justify-center">
                <div className="flex flex-col items-center text-center gap-3 px-6 py-12">
                  {/* icon */}
                  <div className="w-14 h-14 rounded-full bg-(--main-color)/10 flex items-center justify-center">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-(--main-color)"
                    >
                      <path
                        d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2Zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 1 0-3 0v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>

                  {/* title */}
                  <h3 className="text-base font-semibold text-(--secondary-color)">
                    No notifications yet
                  </h3>

                  {/* description */}
                  <p className="text-sm text-slate-400 max-w-xs">
                    You’ll see updates about events, activities, reports, and
                    system alerts here.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {notifications.map((item) => (
                  <NotificationRow
                    key={item.notificationId}
                    item={item}
                    onRead={markRead}
                  />
                ))}

                {hasMore && filter === "all" && (
                  <div className="flex justify-center py-4 shrink-0">
                    <button
                      onClick={() => loadMore()}
                      disabled={isFetchingMore}
                      className="text-sm font-semibold text-(--main-color) hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      {isFetchingMore ? "Loading..." : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
