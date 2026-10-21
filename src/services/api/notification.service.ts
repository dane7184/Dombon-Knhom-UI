import { ApiRes, CursorData } from "@/types/common.type";
import { CommentContext, NotificationItem } from "@/types/notification.type";
import { serverFetch } from "@/lib/server-fetch";
import { clientFetch } from "@/lib/client-fetch";

export type NotificationListResponse = ApiRes<CursorData<NotificationItem>>;
export type UnreadCountResponse = ApiRes<number>;

function buildQuery(cursor?: string, size?: number): string {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (size) params.set("size", String(size));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getNotifications(
  cursor?: string,
  size = 20,
): Promise<NotificationListResponse> {
  const res = await serverFetch(`notifications${buildQuery(cursor, size)}`);
  if (!res.ok) throw res;
  return await res.json();
}

export async function getNotificationsClient(
  cursor?: string,
  size = 20,
): Promise<NotificationListResponse> {
  const res = await clientFetch(`notifications${buildQuery(cursor, size)}`);
  if (!res.ok) throw res;
  return await res.json();
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const res = await clientFetch("notifications/unread-count");
  if (!res.ok) throw res;
  return await res.json();
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<void> {
  const res = await clientFetch(`notifications/${notificationId}/read`, {
    method: "PATCH",
  });
  if (res.status !== 204 && !res.ok) throw res;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const res = await clientFetch("notifications/read-all", {
    method: "PATCH",
  });
  if (res.status !== 204 && !res.ok) throw res;
}

// A notification's `notifiableId` for a Comment can point at either an
// activity (post) comment or an event comment — try both endpoints.
export async function getCommentContext(
  commentId: string,
  targetType?: string | null,
): Promise<CommentContext> {
  const tryEndpoint = async (type: string) => {
    const path = type === "Event" ? "events" : "activities";
    try {
      const res = await clientFetch(`${path}/comments/${commentId}/context`);
      if (res.ok) {
        const json = await res.json();
        return "data" in json ? json.data : json;
      }
    } catch {
      // Ignore and allow fallback
    }
    return null;
  };

  // 1. Try targeted endpoint if targetType is provided
  if (targetType === "Event" || targetType === "Activity") {
    const data = await tryEndpoint(targetType);
    if (data) return data;
  }

  // 2. Fallback: try activities first
  const actData = await tryEndpoint("Activity");
  if (actData) return actData;

  // 3. Fallback: try events next
  const evtData = await tryEndpoint("Event");
  if (evtData) return evtData;

  throw new Error(`Could not resolve comment context for ID: ${commentId}`);
}

// ── Live notifications (GET /notifications/subscribe, text/event-stream) ──
// Moved from lib/notification-sse.ts unchanged so the mock layer can replace it.

const SSE_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const RECONNECT_DELAY_MS = 3000;

/**
 * The backend SSE endpoint requires a Bearer token, which the native
 * EventSource API cannot send. This connects via fetch + ReadableStream
 * instead, parsing the `text/event-stream` payload manually, and
 * auto-reconnects on drop until `unsubscribe` is called.
 */
export function subscribeToNotifications(
  accessToken: string,
  onNotification: (notification: NotificationItem) => void,
): () => void {
  const controller = new AbortController();

  async function connect() {
    while (!controller.signal.aborted) {
      try {
        const res = await fetch(`${SSE_BASE_URL}notifications/subscribe`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "text/event-stream",
          },
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`SSE connection failed: ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const event of events) {
            const data = event
              .split("\n")
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trim())
              .join("");

            if (!data) continue;

            try {
              onNotification(JSON.parse(data) as NotificationItem);
            } catch {
              // ignore malformed/heartbeat payloads
            }
          }
        }
      } catch {
        if (controller.signal.aborted) return;
      }

      if (!controller.signal.aborted) {
        await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY_MS));
      }
    }
  }

  void connect();

  return () => controller.abort();
}
