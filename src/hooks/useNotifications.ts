"use client";

import { useState } from "react";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getNotificationsClient,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NotificationListResponse,
} from "@/services/notification.service";
import { isUnread } from "@/lib/notification.util";
import {
  NOTIFICATIONS_LIST_KEY,
  NOTIFICATIONS_UNREAD_KEY,
} from "@/providers/NotificationProvider";

export type NotificationFilter = "all" | "unread" | "read";

const PAGE_SIZE = 20;

type NotificationsData = InfiniteData<NotificationListResponse>;

function markNotificationRead(
  data: NotificationsData | undefined,
  notificationId: string,
): NotificationsData | undefined {
  if (!data) return data;
  const now = new Date().toISOString();
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: {
        ...page.data,
        content: page.data.content.map((item) =>
          item.notificationId === notificationId
            ? { ...item, read: true, readAt: item.readAt ?? now }
            : item,
        ),
      },
    })),
  };
}

function markAllNotificationsRead(
  data: NotificationsData | undefined,
): NotificationsData | undefined {
  if (!data) return data;
  const now = new Date().toISOString();
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: {
        ...page.data,
        content: page.data.content.map((item) => ({
          ...item,
          read: true,
          readAt: item.readAt ?? now,
        })),
      },
    })),
  };
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const query = useInfiniteQuery({
    queryKey: NOTIFICATIONS_LIST_KEY,
    queryFn: ({ pageParam }) =>
      getNotificationsClient(pageParam as string | undefined, PAGE_SIZE),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.data.hasNext ? lastPage.data.nextCursor ?? undefined : undefined,
  });

  const allNotifications =
    query.data?.pages.flatMap((page) => page.data.content) ?? [];

  const unreadCount = allNotifications.filter(isUnread).length;

  const notifications =
    filter === "unread"
      ? allNotifications.filter(isUnread)
      : filter === "read"
        ? allNotifications.filter((n) => !isUnread(n))
        : allNotifications;

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (_data, notificationId) => {
      queryClient.setQueryData<NotificationsData>(NOTIFICATIONS_LIST_KEY, (data) =>
        markNotificationRead(data, notificationId),
      );
      queryClient.setQueryData<number>(NOTIFICATIONS_UNREAD_KEY, (count) =>
        Math.max(0, (count ?? 1) - 1),
      );
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.setQueryData<NotificationsData>(
        NOTIFICATIONS_LIST_KEY,
        markAllNotificationsRead,
      );
      queryClient.setQueryData(NOTIFICATIONS_UNREAD_KEY, 0);
    },
  });

  return {
    notifications,
    allCount: allNotifications.length,
    unreadCount,
    readCount: allNotifications.length - unreadCount,
    filter,
    setFilter,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasMore: query.hasNextPage ?? false,
    isFetchingMore: query.isFetchingNextPage,
    loadMore: query.fetchNextPage,
    refresh: query.refetch,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
  };
}
