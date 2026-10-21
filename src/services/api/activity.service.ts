import {clientFetch} from "@/lib/client-fetch";
import {
  Activity,
  ActivityComment,
  ActivityCommentComponent,
  ApiActivityComment,
  ApiActivityReply,
  AttendedEventItem,
  CreateActivityData,
  CreateActivityRequest,
  CreateActivityResponse,
  GalleryApiResponse,
  GalleryData,
  GalleryResponse,
  PostDetail,
  RawActivityItem,
  RawGalleryItem,
} from "@/types/activity.type";
import {serverFetch} from "@/lib/server-fetch";
import {formatDate} from "@/lib/format";
import {CursorPage} from "@/types/event.type";
import {mapApiActivityCommentComponent, mapApiActivityReplyComponent,} from "@/lib/activity-map.mapper";

// ============================================================
// READ — Activity Comments
// ============================================================

/**
 * GET /api/v1/activities/{activityId}/comments
 * Fetches top-level comments (parentId: null) for an activity, paginated.
 */
export async function getActivityComments(
  activityId: string,
  cursor: string | null = null,
  size: number = 5,
): Promise<ActivityCommentComponent> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("limit", String(size));

  const response = await serverFetch(
    `activities/${activityId}/comments?${params.toString()}`,
    { cache: "no-store" } as RequestInit,
  );

  const result = await response.json();
  if (!response.ok || !result.success) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return { comments: [], nextCursor: null, hasNext: false };
  }

  const page: CursorPage<ApiActivityComment> = result.data;
  return mapApiActivityCommentComponent(page);
}

/**
 * GET /api/v1/activities/{activityId}/comments — client-side "load more".
 * Returns null when the request fails so the caller can keep its current list.
 */
export async function loadMoreActivityComments(
  activityId: string,
  cursor: string,
  size: number = 5,
): Promise<ActivityCommentComponent | null> {
  const response = await clientFetch(
    `activities/${activityId}/comments?cursor=${encodeURIComponent(cursor)}&limit=${size}`,
  );
  const result = await response.json();
  if (!result.success) return null;

  return mapApiActivityCommentComponent(result.data);
}

/**
 * GET /api/v1/activities/comments/{commentId}/replies
 * Fetches direct children (replies) of ANY comment/reply id, paginated.
 * Called from the client (handleLoadReplies) — uses clientFetch, not serverFetch.
 */
export async function getActivityCommentReplies(
  commentId: string,
  cursor: string | null = null,
  size: number = 5,
): Promise<{
  replies: ActivityComment[];
  nextCursor: string | null;
  hasNext: boolean;
}> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("limit", String(size));

  const response = await clientFetch(
    `activities/comments/${commentId}/replies?${params.toString()}`,
  );

  const result = await response.json();
  if (!response.ok || !result.success) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return { replies: [], nextCursor: null, hasNext: false };
  }

  const page: CursorPage<ApiActivityReply> = result.data;
  return mapApiActivityReplyComponent(page);
}

// ============================================================
// WRITE — Activity Comments (used only via actions, never directly)
// ============================================================

/**
 * POST /api/v1/activities/{activityId}/comments
 * Returns the new comment's id, or null on failure.
 */
export async function postActivityCommentService(
  activityId: string,
  content: string,
): Promise<string | null> {
  const response = await serverFetch(`activities/${activityId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  } as RequestInit);

  const result = await response.json();
  if (!response.ok || !result.success) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return null;
  }

  return result.data.commentId;
}

/**
 * POST /api/v1/activities/comments/{commentId}/replies
 * `commentId` can be a top-level comment OR a nested reply id.
 * Returns the new reply's id, or null on failure.
 */
export async function postActivityReplyService(
  commentId: string,
  content: string,
): Promise<string | null> {
  const response = await serverFetch(
    `activities/comments/${commentId}/replies`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    } as RequestInit,
  );

  const result = await response.json();
  if (!response.ok || !result.success) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return null;
  }

  return result.data.commentId;
}

/**
 * PATCH /api/v1/activities/comments/{commentId}
 * Works for both top-level comments and replies.
 */
export async function editActivityCommentService(
  commentId: string,
  content: string,
): Promise<{ success: boolean; message: string }> {
  const response = await serverFetch(`activities/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  } as RequestInit);

  const result = await response.json();
  if (!response.ok || !result.success) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return {
      success: false,
      message: result.message ?? "Failed to edit comment.",
    };
  }

  return {
    success: true,
    message: result.message ?? "Comment updated successfully",
  };
}

/**
 * DELETE /api/v1/activities/comments/{commentId}
 * Works for both top-level comments and replies.
 */
export async function deleteActivityCommentService(
  commentId: string,
): Promise<{ success: boolean; message: string }> {
  const response = await serverFetch(`activities/comments/${commentId}`, {
    method: "DELETE",
  } as RequestInit);

  const result = await response.json();
  if (!response.ok || !result.success) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return {
      success: false,
      message: result.message ?? "Failed to delete comment.",
    };
  }

  return {
    success: true,
    message: result.message ?? "Comment deleted successfully",
  };
}

export async function fetchMyAttendedEvents(): Promise<AttendedEventItem[]> {
  // 1. Fetch current user to get the exact userId
  const meRes = await clientFetch("users/me");
  if (!meRes.ok) {
    const text = await meRes.text();
    throw new Error(`Failed to fetch current user: ${text}`);
  }
  const meJson = await meRes.json();
  const userId = meJson.data.userId;

  if (!userId) {
    throw new Error("User ID not found in /users/me response");
  }

  // 2. Fetch attended events using the reliable userId
  const res = await clientFetch(`users/${userId}/events/attended`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch attended events: ${text}`);
  }

  const json = await res.json();


  // Defensive parsing in case the backend returns a flat array in `data`
  // or a paginated object in `data.content`
  if (Array.isArray(json.data)) {
    return json.data;
  } else if (json.data && Array.isArray(json.data.content)) {
    return json.data.content;
  }

  return [];
}
export async function getActivityDetail(
  activityId: string,
): Promise<RawActivityItem | null> {
  const res = await serverFetch(`activities/${activityId}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    console.warn(`[getActivityDetail] 404 for activity ${activityId}`);
    return null;
  }

  if (!res.ok) {
    const text = await res.text();
    console.error(
      `[getActivityDetail] ${res.status} for activity ${activityId}: ${text}`,
    );
    throw new Error(`Failed to fetch activity ${activityId}: ${text}`);
  }

  const json = await res.json();
  if (json.data) {
    return json.data;
  }
  
  if (json.activityId) {
    return json;
  }

  console.warn(
    `[getActivityDetail] 200 but no valid data for activity ${activityId}:`,
    JSON.stringify(json),
  );
  return null;
}

// Server-side writes used by actions/activity.actions.ts. They throw the
// failed Response so the action can read the backend's ProblemDetails.
export async function createActivityServer(
  data: CreateActivityRequest,
): Promise<{ postId?: string; id?: string; activityId?: string }> {
  const res = await serverFetch("activities", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw res;
  const json = await res.json();
  return json.data;
}

export async function updateActivityServer(
  activityId: string,
  data: Partial<CreateActivityRequest>,
): Promise<void> {
  const res = await serverFetch(`activities/${activityId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw res;
}

export async function deleteActivityServer(activityId: string): Promise<void> {
  const res = await serverFetch(`activities/${activityId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw res;
}

export async function createActivity(
  data: CreateActivityRequest,
): Promise<CreateActivityData> {
  const res = await clientFetch("activities", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create activity: ${text}`);
  }

  const json: CreateActivityResponse = await res.json();
  return json.data;
}

export async function updateActivity(
  activityId: string,
  data: Partial<CreateActivityRequest>,
): Promise<void> {
  const res = await clientFetch(`activities/${activityId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update activity: ${text}`);
  }
}

export async function deleteActivity(activityId: string): Promise<void> {
  const res = await clientFetch(`activities/${activityId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete activity: ${text}`);
  }
}

export async function reportActivity(
  activityId: string,
  reason: string,
  details: string,
): Promise<void> {
  const res = await clientFetch(`activities/${activityId}/report`, {
    method: "POST",
    body: JSON.stringify({ reason, details }),
  });

  if (!res.ok) {
    let errorMessage = "Unknown server error";
    try {
      const errorJson = await res.json();
      errorMessage = errorJson.detail || errorJson.message || res.statusText;
    } catch {
      errorMessage = await res.text();
    }
    throw new Error(errorMessage);
  }
}

export async function removeMediaFromActivity(
  activityId: string,
  mediaId: string,
): Promise<void> {
  const res = await clientFetch(`activities/${activityId}/media/${mediaId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    let errorText = `${res.status} ${res.statusText}`;
    try {
      errorText = await res.text();
    } catch {}
    throw new Error(`Failed to delete media ${mediaId}: ${errorText}`);
  }
}

export async function uploadActivityImages(
  activityId: string,
  files: File[],
): Promise<void> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const res = await clientFetch(`activities/${activityId}/images`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let errorMessage = "Unknown server error";
    try {
      const errorJson = await res.json();
      errorMessage = errorJson.detail || errorJson.message || res.statusText;
    } catch {
      errorMessage = await res.text();
    }
    throw new Error(`Image upload failed: ${errorMessage}`);
  }
}

export async function uploadActivityVideo(
  activityId: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await clientFetch(`activities/${activityId}/videos`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let errorMessage = "Unknown server error";
    try {
      const errorJson = await res.json();
      errorMessage = errorJson.detail || errorJson.message || res.statusText;
    } catch {
      errorMessage = await res.text();
    }
    throw new Error(`Video upload failed: ${errorMessage}`);
  }
}

export interface FeedPage {
  activities: Activity[];
  nextCursor: string | null;
  hasNext: boolean;
}

function toRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "now";
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = Math.abs(now - then);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y`;
}

/**
 * Maps one GET /activities/feed item to the feed card shape. Exported so the
 * mock service produces exactly the same output from mock RawActivityItems.
 */
export function mapRawActivityToFeedActivity(
  item: RawActivityItem,
  currentUserId?: string,
  currentOrgId?: string | null,
): Activity {
  // Return raw backend file path string directly to the client; resolveUrl resolves it on render
  const toProxiedUrl = (raw: string | null | undefined): string => {
    if (!raw) return "";
    return raw;
  };

  return {
    activitiesId: item.activityId,
    user: {
      userId: item.userId || item.orgId || "unknown",
      username: item.ownerName || "Delete Account",
      profileImage:
        toProxiedUrl(item.ownerAvatar) || "/images/fallback-pf.png",
      isOrg: !item.userId && !!item.orgId,
    },
    location: item.province ? item.province.replace(/_/g, " ") : "",
    type: item.media[0]?.type.toLowerCase() === "video" ? "video" : "image",
    content: item.content,
    tags: item.tags.map((t) => t.name),
    media: item.media.map((m) => ({
      url: m.fileUrl,
      type: m.type.toLowerCase() as "image" | "video",
      actMediaId: m.actMediaId,
      duration: m.durationSeconds?.toString() || null,
    })),
    linkedEvent: item.event
      ? {
          eventId: item.event.eventId,
          eventTitle: item.event.eventName,
        }
      : undefined,
    likes: item.likeCount,
    commentsCount: item.commentCount,
    shares: 0,
    isOwner: currentOrgId
      ? Boolean(item.orgId && item.orgId === currentOrgId)
      : Boolean(currentUserId && item.userId === currentUserId),
    isLiked: item.isLiked,
    isSaved: item.isSaved,
    createdAt: toRelativeTime(item.createdAt),
  };
}

export async function fetchActivityFeed(
  cursor?: string,
  accessToken?: string,
  currentUserId?: string,
  currentOrgId?: string | null,
): Promise<FeedPage> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
  const url = cursor
    ? `${BASE_URL}activities/feed?size=10&sort=createdAt,desc&cursor=${encodeURIComponent(cursor)}`
    : `${BASE_URL}activities/feed?size=10&sort=createdAt,desc`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return { activities: [], nextCursor: null, hasNext: false };
  }

  const json = await res.json();
  const page = json.data ?? {};
  const items: RawActivityItem[] = page.content ?? [];

  const now = Date.now();
  const activities = items
    .filter((item) => {
      if (item.createdAt) {
        const then = new Date(item.createdAt).getTime();
        if (then > now) return false;
      }
      return true;
    })
    .map((item) => mapRawActivityToFeedActivity(item, currentUserId, currentOrgId));

  return {
    activities,
    nextCursor: page.nextCursor ?? null,
    hasNext: page.hasNext ?? false,
  };
}

/** Maps GET /activities/gallery items to grid tiles (shared by API and mock). */
export function mapRawGalleryItems(items: RawGalleryItem[]): GalleryResponse[] {
  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return items.map((item) => ({
    id: item.activityId,
    src: item.previewUrl,
    type: item.mediaType.toUpperCase() as "IMAGE" | "VIDEO",
    hasMore: item.hasMore,
    alt: "Gallery Item",
    duration:
      item.mediaType === "Video" ? formatDuration(item.durations) : null,
    createdAt: item.createdAt,
  }));
}

export async function getGallery(cursor?: string | null): Promise<GalleryData> {
  const url = cursor
    ? `activities/gallery?size=10&cursor=${encodeURIComponent(cursor)}`
    : "activities/gallery?size=10";

  const res = await clientFetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch gallery: ${res.status}`);
  }

  const json: GalleryApiResponse = await res.json();

  return {
    content: mapRawGalleryItems(json.data.content),
    nextCursor: json.data.nextCursor,
    hasNext: json.data.hasNext,
  };
}

/** Server-side gallery page (used by getGalleryAction). */
export async function getGalleryPage(cursor?: string | null): Promise<GalleryData> {
  const url = cursor
    ? `activities/gallery?size=10&cursor=${encodeURIComponent(cursor)}`
    : "activities/gallery?size=10";

  const res = await serverFetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch gallery: ${res.status}`);
  }

  const json: GalleryApiResponse = await res.json();

  return {
    content: mapRawGalleryItems(json.data.content),
    nextCursor: json.data.nextCursor || null,
    hasNext: json.data.hasNext || false,
  };
}

/**
 * Legacy server-side like/save toggles used by actions/activity.ts. Kept
 * as-is (they read an "accessToken" cookie); returns whether the call succeeded.
 */
export async function toggleActivityReactionWithCookie(
  activityId: string,
  reaction: "like" | "saved",
  token: string | undefined,
): Promise<boolean> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/${activityId}/${reaction}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.ok;
}

export async function toggleLikeActivity(activityId: string) {
  const res = await clientFetch(`activities/${activityId}/like`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Failed to toggle like: ${res.status}`);
  }
}

export async function toggleSavedActivity(activityId: string) {
  const res = await clientFetch(`activities/${activityId}/saved`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Failed to toggle save: ${res.status}`);
  }
}

const POST_DETAIL_FALLBACK_AVATAR = "/images/fallback-pf.png";

function toAbsoluteMediaUrl(
  raw: string | null | undefined,
  mediaType?: string,
): string {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (!raw || raw.trim() === "") return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) {
    try {
      return new URL(raw, BASE_URL).toString();
    } catch {
      return `${BASE_URL}${raw.substring(1)}`;
    }
  }
  if (raw.includes("/")) {
    return `${BASE_URL}${raw}`;
  }
  const isVideo =
    mediaType?.toLowerCase() === "video" ||
    raw.endsWith(".mp4") ||
    raw.endsWith(".webm") ||
    raw.endsWith(".mov");
  const prefix = isVideo ? "media/videos/" : "media/images/";
  return `${BASE_URL}${prefix}${raw}`;
}

function toProxiedMediaUrl(
  raw: string | null | undefined,
  mediaType?: string,
): string {
  const absolute = toAbsoluteMediaUrl(raw, mediaType);
  if (!absolute) return "";
  if (absolute.startsWith("/")) return absolute;
  return `/api/media-proxy?url=${encodeURIComponent(absolute)}`;
}

export type MappedPostDetail = PostDetail & {
  postMedia?: { actMediaId: string; url: string; type: string }[];
};

/**
 * `resolveMedia` turns a raw media/avatar path into a renderable URL. It
 * defaults to the backend media proxy; the mock service passes a resolver that
 * keeps local /public paths as they are.
 */
export function mapActivityDetailToPostDetail(
  raw: RawActivityItem,
  fallbackId: string,
  resolveMedia: (raw: string | null | undefined, mediaType?: string) => string = toProxiedMediaUrl,
): MappedPostDetail {
  const sortedMedia = [...(raw.media ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const isVideo = sortedMedia[0]?.type?.toLowerCase() === "video";
  // Drop any media that resolve to an empty URL — an empty src crashes next/image.
  const postContent = sortedMedia
    .map((m) => resolveMedia(m.fileUrl, m.type))
    .filter(Boolean);

  const postMedia = sortedMedia.map((m) => ({
    actMediaId: m.actMediaId,
    url: resolveMedia(m.fileUrl, m.type),
    type: m.type,
  }));

  const mapped = {
    postId: raw.activityId ?? fallbackId,
    postType: isVideo ? "Video" : "Image",
    postContent,
    postMedia,
    postLocation: raw.province ? raw.province.replace(/_/g, " ") : "",
    duration: isVideo ? sortedMedia[0]?.durationSeconds?.toString() : null,
    postDescription: raw.content ?? "",
    totalLikes: raw.likeCount ?? 0,
    isLiked: raw.isLiked ?? false,
    isSaved: raw.isSaved ?? false,
    totalComments: raw.commentCount ?? 0,
    comments: [],
    postUser: {
      posterId: raw.userId ?? raw.orgId ?? "",
      fullName: raw.ownerName ?? "Unknown",
      posterImage:
        resolveMedia(raw.ownerAvatar) || POST_DETAIL_FALLBACK_AVATAR,
      isOrganizer: !raw.userId && !!raw.orgId,
      isFavorite: false,
      datePosted: raw.createdAt ? formatDate(raw.createdAt) : "",
      tags: (raw.tags ?? []).map((t) => t.name),
    },
    likedEvent: raw.event
      ? {
          eventId: raw.event.eventId,
          eventTittle: raw.event.eventName,
          eventImage:
            resolveMedia(raw.event.cover) || POST_DETAIL_FALLBACK_AVATAR,
          startDate: raw.event.startAt ? formatDate(raw.event.startAt) : "",
          stopDate: raw.event.endAt ? formatDate(raw.event.endAt) : "",
          location:
            (typeof raw.event.address === "object" && raw.event.address !== null
              ? [
                  raw.event.address.specificAddr,
                  raw.event.address.commune,
                  raw.event.address.district,
                ]
                  .filter(Boolean)
                  .join(", ")
              : raw.event.address) ??
            (raw.province ? raw.province.replace(/_/g, " ") : ""),
        }
      : null,
  };

  return mapped as unknown as MappedPostDetail;
}
