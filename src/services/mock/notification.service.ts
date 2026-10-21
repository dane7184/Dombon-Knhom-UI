// Mock implementation of services/api/notification.service.ts.
// Notifications belong to the current viewer: the organization in org mode,
// otherwise the user. Read-state changes are in-memory only.

import type { CommentContext, NotificationItem } from "@/types/notification.type";
import type {
  NotificationListResponse,
  UnreadCountResponse,
} from "@/services/api/notification.service";
import { findMockComment } from "@/mocks/comments.mock";
import {
  createLiveMockNotification,
  mockNotifications,
  notificationsFor,
  toNotificationItem,
} from "@/mocks/notifications.mock";
import { getMockViewer } from "@/mocks/session";
import { apiRes, cursorPage, logMockWrite, mockRequest } from "@/mocks/utils";

/**
 * Set NEXT_PUBLIC_MOCK_NOTIFICATION_DELAY_MS (e.g. 15000) to receive one
 * simulated live notification that long after subscribing. Unset = silent.
 */
const LIVE_NOTIFICATION_DELAY_MS = Number(process.env.NEXT_PUBLIC_MOCK_NOTIFICATION_DELAY_MS ?? 0);

async function recipientId(): Promise<string | null> {
  const viewer = await getMockViewer();
  return viewer?.orgId ?? viewer?.userId ?? null;
}

async function listNotifications(cursor?: string, size = 20): Promise<NotificationListResponse> {
  await mockRequest("notification.list");
  const page = cursorPage(notificationsFor(await recipientId()), cursor, size);
  return apiRes({
    content: page.content.map(toNotificationItem),
    nextCursor: page.nextCursor,
    hasNext: page.hasNext,
  });
}

export async function getNotifications(cursor?: string, size = 20): Promise<NotificationListResponse> {
  return listNotifications(cursor, size);
}

export async function getNotificationsClient(cursor?: string, size = 20): Promise<NotificationListResponse> {
  return listNotifications(cursor, size);
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  await mockRequest("notification.unread");
  const unread = notificationsFor(await recipientId()).filter((n) => !n.read).length;
  return apiRes(unread);
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await mockRequest("notification.read");
  const record = mockNotifications.find((n) => n.notificationId === notificationId);
  if (!record) throw new Error("Notification not found");
  if (!record.read) {
    record.read = true;
    record.readAt = new Date().toISOString();
  }
  logMockWrite("markNotificationAsRead", { notificationId });
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await mockRequest("notification.readAll");
  const now = new Date().toISOString();
  for (const record of notificationsFor(await recipientId())) {
    if (!record.read) {
      record.read = true;
      record.readAt = now;
    }
  }
  logMockWrite("markAllNotificationsAsRead");
}

export async function getCommentContext(commentId: string): Promise<CommentContext> {
  await mockRequest("notification.commentContext");
  const comment = findMockComment(commentId);
  if (!comment) throw new Error(`Could not resolve comment context for ID: ${commentId}`);
  return {
    anchorId: comment.commentId,
    targetId: comment.targetId,
    targetType: comment.target === "event" ? "Event" : "Activity",
    parentId: comment.parentId,
    cursor: null,
  };
}

/** No network stream in mock mode; optionally emits one simulated notification. */
export function subscribeToNotifications(
  _accessToken: string,
  onNotification: (notification: NotificationItem) => void,
): () => void {
  if (!(LIVE_NOTIFICATION_DELAY_MS > 0)) return () => {};

  let cancelled = false;
  const timer = setTimeout(async () => {
    const recipient = await recipientId();
    if (cancelled || !recipient) return;
    onNotification(toNotificationItem(createLiveMockNotification(recipient)));
  }, LIVE_NOTIFICATION_DELAY_MS);

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}
