// event.service.ts
// READ services: called directly from server components / pages
// WRITE services (*Service): called only from server actions, never from client directly

import { serverFetch } from "@/lib/server-fetch";
import { clientFetch } from "@/lib/client-fetch";
import { auth } from "@/lib/auth";
import {
  MapEvent,
  EventDetail,
  EventCommentComponent,
  EventRatingComponent,
  EventReply,
  JoinEventResult,
  ApiJoinEvent,
  ApiOrgProfile,
  ApiUserProfile,
  OrgProfile,
  UserProfile,
  UpcomingEventRequest,
  UpcomingEventResponse,
} from "@/types/event.type";
import {
  mapApiEvents,
  mapApiEventDetail,
  mapApiCommentComponent,
  mapApiReplyComponent,
  mapApiRatingComponent,
} from "@/lib/event-map.mapper";
import { pointInGeometry } from "@/lib/geoUtils";

// ============================================================
// SHARED TYPES
// ============================================================

export type DateRangeFilter = "all" | "today" | "upcoming";

// Polygon filter stays client-side only — not sent to backend
export interface PolygonFilter {
  polygon: import("geojson").Geometry | null;
}

// Params sent to GET /api/v1/events
export interface EventParams {
  search?: string | null;
  province?: string | null;
  district?: string | null;
  commune?: string | null;
  categoryIds?: string[] | null;
  startFrom?: string | null;
  endAt?: string | null;
  cursor?: string | null;
  size?: number;
}

export interface EventListResult {
  events: MapEvent[];
  nextCursor: string | null;
  hasNext: boolean;
}

// ============================================================
// UTILITIES
// ============================================================

/**
 * Converts a Date or ISO string to YYYY-MM-DD format.
 * Fixes the previous bug where month and day were swapped.
 */
export function formatDateString(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Builds URL query string from EventParams for GET /api/v1/events.
 */
function buildEventParams(params: EventParams): string {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.province) query.set("province", params.province);
  if (params.district) query.set("district", params.district);
  if (params.commune) query.set("commune", params.commune);
  if (params.categoryIds?.length)
    query.set("categoryIds", params.categoryIds.join(","));
  if (params.startFrom) query.set("startFrom", params.startFrom);
  if (params.endAt) query.set("endAt", params.endAt);
  if (params.cursor) query.set("cursor", params.cursor);
  if (params.size) query.set("size", String(params.size));
  return query.toString();
}

/**
 * Polygon filter — applied client-side on top of server results.
 * Only used by map page for boundary drilling.
 */
export function filterByPolygon(
  events: MapEvent[] = [],
  polygon: import("geojson").Geometry | null,
): MapEvent[] {
  if (!polygon) return events ?? [];
  return (events ?? []).filter((e) => pointInGeometry(e.lat, e.lng, polygon));
}

/**
 * serverFetch on the server, clientFetch in the browser — both attach the
 * session token. Lets list/comment reads be shared by server pages and the
 * client-side "load more" handlers.
 */
function sessionFetch(path: string, init?: RequestInit): Promise<Response> {
  return typeof window === "undefined"
    ? serverFetch(path, init)
    : clientFetch(path, init);
}

// ============================================================
// READ SERVICES — server components / pages only
// ============================================================

/**
 * GET /api/v1/events
 * For map view — fetches all events without pagination.
 * `no-store`: refetched fresh from the backend on every request (reload/enter).
 */
export async function getAllEvents(
  params: EventParams = {},
): Promise<MapEvent[]> {
  const bufferStartDate = new Date();
  const query = buildEventParams({
    ...params,
    size: 100,
    startFrom: params.startFrom ?? formatDateString(bufferStartDate),
  });

  const response = await serverFetch(`events?${query}`, {
    cache: "no-store",
  } as RequestInit);

  const result = await response.json();
  if (!response.ok) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return [];
  }

  return mapApiEvents(result.data.content);
}

export async function getEventList(
  params: EventParams = {},
): Promise<EventListResult> {
  const bufferStartDate = new Date();
  const query = buildEventParams({
    ...params,
    size: params.size ?? 20,
    startFrom: params.startFrom ?? formatDateString(bufferStartDate),
  });

  const response = await sessionFetch(`events?${query}`, {
    cache: "no-store",
  } as RequestInit);

  const result = await response.json();
  if (!response.ok) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return { events: [], nextCursor: null, hasNext: false };
  }

  return {
    events: mapApiEvents(result.data.content),
    nextCursor: result.data.nextCursor,
    hasNext: result.data.hasNext,
  };
}

/**
 * GET /api/v1/events/{eventId}
 */
export async function getEventDetail(
  eventId: string,
): Promise<EventDetail | null> {
  const response = await serverFetch(`events/${eventId}`);
  const result = await response.json();

  if (!response.ok) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return null;
  }

  const detail = mapApiEventDetail(result.data);
  
  let isOwner = false;
  try {
    const session = await auth();
    const currentUserId = session?.user?.userId;
    const currentOrgId = session?.user?.orgId;
    const currentRole = session?.user?.role;
    isOwner = currentOrgId
      ? Boolean(detail.organizerId && detail.organizerId === currentOrgId)
      : Boolean(detail.creatorId && detail.creatorId === currentUserId);
  } catch(e) {
    console.error('Failed to get session for ownership check', e);
  }

  if (isOwner) {
    // Fetch attendee preview to count joined members
    try {
      const attendees = await getEventAttendeesPreview(eventId);
      detail.joined = attendees.length;
    } catch (e) {
      console.error('Failed to fetch attendee preview', e);
    }
  }

  return detail;
}

// ── GET /api/v1/events/{eventId}/attendees/preview ─────────────────────
export async function getEventAttendeesPreview(eventId: string): Promise<Array<{ userId: string; fullName: string; email: string; checkInAt: string | null }>> {
  const response = await serverFetch(`events/${eventId}/attendees/preview`);
  const result = await response.json();
  if (!response.ok) {
    console.error(JSON.stringify({ httpStatus: response.status, responseBody: result }, null, 2));
    return [];
  }
  return result.data ?? [];
}



/**
 * GET /api/v1/events/{eventId}/comment
 * First fetch: cursor null, limit 5. Subsequent: pass nextCursor from previous response.
 * Works from server pages and from client "load more" handlers.
 */
export async function getEventComments(
  eventId: string,
  cursor: string | null = null,
  limit: number = 5,
): Promise<EventCommentComponent> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("limit", String(limit));

  const response = await sessionFetch(
    `events/${eventId}/comment?${params.toString()}`,
  );
  const result = await response.json();

  if (!response.ok) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return { comments: [], nextCursor: null, hasNext: false };
  }

  return mapApiCommentComponent(result.data);
}

/**
 * GET /api/v1/events/comment/{commentId}/replies
 * Called client-side when user expands replies. Uses clientFetch since it's triggered by user interaction.
 */
export async function getCommentReplies(
  commentId: string,
  cursor: string | null = null,
  limit: number = 5,
): Promise<{
  replies: EventReply[];
  nextCursor: string | null;
  hasNext: boolean;
}> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("limit", String(limit));

  const response = await clientFetch(
    `events/comment/${commentId}/replies?${params.toString()}`,
  );
  const result = await response.json();

  if (!response.ok) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return { replies: [], nextCursor: null, hasNext: false };
  }

  return mapApiReplyComponent(result.data);
}

/**
 * GET /api/v1/events/{eventId}/ratings
 * Called client-side for load more ratings pagination.
 */
export async function getEventRatings(
  eventId: string,
  page = 1,
  size = 20,
): Promise<EventRatingComponent> {
  const response = await clientFetch(
    `events/${eventId}/ratings?page=${page}&size=${size}`,
  );
  const result = await response.json();

  if (!response.ok) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return {
      ratings: [],
      page: 1,
      totalElements: 0,
      totalPages: 0,
      isFirst: true,
      isLast: true,
    };
  }

  return mapApiRatingComponent(result.data);
}

/**
 * GET /api/v1/organizations/{orgId}
 * Called server-side in page.tsx so isFavorite reflects the
 * currently logged-in user's session correctly.
 */
export async function getOrgProfile(orgId: string): Promise<OrgProfile | null> {
  const response = await serverFetch(`organizations/${orgId}`, {
    cache: "no-store",
  } as RequestInit);
  const result = await response.json();

  if (!response.ok) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return null;
  }

  const data: ApiOrgProfile = result.data;
  return {
    id: data.orgId,
    name: data.name,
    avatarUrl: data.logo ?? null,
    about: data.about,
    phone: data.phone,
    website: data.website,
    province: data.province,
    badges: data.badge,
    eventCount: data.eventCount,
    activityCount: data.activityCount,
    favoriteCount: data.favoriteCount,
    isFavorite: data.isFavorite,
  };
}

/**
 * GET /api/v1/users/{userId}/profile
 * Called server-side in page.tsx so isFavorite reflects the
 * currently logged-in user's session correctly.
 */
export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const response = await serverFetch(`users/${userId}/profile`, {
    cache: "no-store",
  } as RequestInit);
  const result = await response.json();

  if (!response.ok) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return null;
  }

  const data: ApiUserProfile = result.data;
  return {
    id: data.userId,
    name: data.fullName,
    avatarUrl: data.avatar ?? null,
    badges: data.badge,
    favoriteCount: data.favoriteCount,
    activityCount: data.activityCount,
    createdEventCount: data.createdEventCount,
    orgId: data.orgId,
    orgName: data.orgName,
    orgLogo: data.orgLogo,
    isFavorite: data.isFavorite,
  };
}

// ============================================================
// WRITE SERVICES — called by server actions only
// Never import these directly in client components
// ============================================================

export async function toggleLikeService(eventId: string): Promise<boolean> {
  const response = await serverFetch(`events/${eventId}/like`, {
    method: "POST",
  });
  const result = await response.json();
  if (!response.ok) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return false;
  }
  return true;
}

/**
 * Toggles save/unsave for an event.
 * Returns isSaved (new state) + message — used for success-only toast.
 */
export async function toggleSaveService(
  eventId: string,
): Promise<{ success: boolean; message: string }> {
  const response = await serverFetch(`events/${eventId}/saved`, {
    method: "POST",
  });
  const result = await response.json();
  if (!response.ok) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return {
      success: false,
      message: result.message ?? "Failed to update save status.",
    };
  }
  return { success: true, message: result.message ?? "Saved" };
}

export async function reportEventService(
  eventId: string,
  reason: string,
  details: string,
): Promise<{ success: boolean; message: string }> {
  const response = await serverFetch(`events/${eventId}/report`, {
    method: "POST",
    body: JSON.stringify({ reason, details }),
  });
  const result = await response.json();
  if (!response.ok) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return {
      success: false,
      message: result.message ?? "Failed to submit report.",
    };
  }
  return {
    success: true,
    message: result.message ?? "Event reported successfully",
  };
}

export async function rateEventService(
  eventId: string,
  score: 1 | 2 | 3 | 4 | 5,
  review: string,
): Promise<{ success: boolean; message: string }> {
  const response = await serverFetch(`events/${eventId}/rate`, {
    method: "POST",
    body: JSON.stringify({ score, review }),
  });
  const result = await response.json();
  if (!response.ok) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return {
      success: false,
      message: result.message ?? "Failed to submit rating.",
    };
  }
  return {
    success: true,
    message: result.message ?? "Rating submitted successfully",
  };
}

export async function joinEventService(
  eventId: string,
): Promise<{ data: JoinEventResult | null; message: string }> {
  const response = await serverFetch(`events/${eventId}/join`, {
    method: "POST",
  });
  const result = await response.json();
  if (!response.ok) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return { data: null, message: result.message ?? "Failed to join event." };
  }
  const data: ApiJoinEvent = result.data;
  return {
    data: {
      requiresPayment: data.requiresPayment,
      attendeeId: data.attendeeId,
      ticketQr: data.ticketQr,
      bakongQrString: data.bakongQrString,
      bakongQrImage: data.bakongQrImage,
      md5: data.md5,
      currency: data.currency,
    },
    message: result.message ?? "Joined event successfully",
  };
}

export async function postCommentService(
  eventId: string,
  content: string,
): Promise<string | null> {
  const response = await serverFetch(`events/${eventId}/comment`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
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

export async function postReplyService(
  commentId: string,
  content: string,
): Promise<string | null> {
  const response = await serverFetch(`events/comments/${commentId}/replies`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
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

export async function editCommentService(
  commentId: string,
  content: string,
): Promise<{ data: string | null; message: string }> {
  const response = await serverFetch(`events/comment/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });
  const result = await response.json();
  if (!response.ok) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return { data: null, message: result.message ?? "Failed to edit comment." };
  }
  return {
    data: result.data?.commentId ?? null,
    message: result.message ?? "Comment updated successfully",
  };
}

export async function deleteCommentService(
  commentId: string,
): Promise<{ success: boolean; message: string }> {
  const response = await serverFetch(`events/comment/${commentId}`, {
    method: "DELETE",
  });
  const result = await response.json();
  if (!response.ok) {
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

export async function toggleFavoriteOrgService(
  orgId: string,
): Promise<{ success: boolean; message: string }> {
  const response = await serverFetch(`organizations/${orgId}/favorites`, {
    method: "POST",
  });
  const result = await response.json();
  if (!response.ok) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return {
      success: false,
      message: result.message ?? "Failed to update favorite status.",
    };
  }
  return {
    success: true,
    message: result.message ?? "Favorite status updated",
  };
}

export async function toggleFavoriteUserService(
  userId: string,
): Promise<{ success: boolean; message: string }> {
  const response = await serverFetch(`users/${userId}/favorite`, {
    method: "POST",
  });
  const result = await response.json();
  if (!response.ok) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return {
      success: false,
      message: result.message ?? "Failed to update favorite status.",
    };
  }
  return {
    success: true,
    message: result.message ?? "Favorite status updated",
  };
}

export interface CreateEventAgendaItem {
  order: number;
  startTime: string;
  endTime: string;
  speakerName: string;
  description: string;
}

export interface CreateEventRequest {
  title: string;
  categoryId: string;
  capacity: number;
  startAt: string;
  endAt: string;
  description: string;
  price: number;
  address: string | { district: string; commune: string; specificAddr: string };
  latitude: number;
  longitude: number;
  province: string;
  agenda?: Record<
    string,
    {
      order: number;
      startTime: string;
      endTime: string;
      speakerName: string;
      description: string;
    }[]
  >;
}

// ── Used by server actions (event.actions.ts) ───────────────────
// Throw the Response on failure so the action's handleError can read the
// backend's ProblemDetails body. `tokenOverride` replaces the session token
// (e.g. right after switching to organization mode).

function withTokenOverride(init: RequestInit, tokenOverride?: string): RequestInit {
  if (tokenOverride) {
    init.headers = { Authorization: `Bearer ${tokenOverride}` };
  }
  return init;
}

export async function createEventService(
  data: CreateEventRequest,
  tokenOverride?: string,
): Promise<{ eventId: string }> {
  const res = await serverFetch(
    "events",
    withTokenOverride({ method: "POST", body: JSON.stringify(data) }, tokenOverride),
  );
  if (!res.ok) throw res;
  const json = await res.json();
  return json.data;
}

export async function updateEventService(
  eventId: string,
  data: CreateEventRequest,
  tokenOverride?: string,
): Promise<{ eventId: string }> {
  const res = await serverFetch(
    `events/${eventId}`,
    withTokenOverride({ method: "PUT", body: JSON.stringify(data) }, tokenOverride),
  );
  if (!res.ok) throw res;
  const json = await res.json();
  return json.data;
}

export async function deleteEventService(
  eventId: string,
  tokenOverride?: string,
): Promise<void> {
  const res = await serverFetch(
    `events/${eventId}`,
    withTokenOverride({ method: "DELETE" }, tokenOverride),
  );
  if (!res.ok) throw res;
}

export async function createEvent(
  data: CreateEventRequest,
  orgId?: string,
  token?: string,
): Promise<any> {
  const url = `events`;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create event: ${text}`);
  }

  const json = await res.json();
  return json.data;
}

export async function updateEvent(
  eventId: string,
  data: CreateEventRequest,
  token?: string,
): Promise<any> {
  const url = `events/${eventId}`;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update event: ${text}`);
  }

  const json = await res.json();
  return json.data;
}

export async function uploadEventCover(
  eventId: string,
  file: File,
  token?: string,
): Promise<{ coverUrl: string }> {
  const formData = new FormData();
  formData.append("cover", file);

  const url = `events/${eventId}/cover`;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    method: "POST",
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to upload cover: ${text}`);
  }

  const json = await res.json();
  return json.data;
}

export async function fetchEventDetails(eventId: string): Promise<any> {
  const res = await clientFetch(`events/${eventId}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch event details: ${text}`);
  }

  const json = await res.json();
  return json.data;
}

export async function fetchOrganizationEvents(
  orgId: string,
  cursor?: string,
): Promise<any> {
  const url = cursor
    ? `organizations/${orgId}/events?cursor=${cursor}`
    : `organizations/${orgId}/events`;
  const res = await clientFetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch organization events: ${text}`);
  }

  const json = await res.json();
  return json.data;
}

export async function deleteEvent(
  eventId: string,
  token?: string,
): Promise<any> {
  const url = `events/${eventId}`;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete event: ${text}`);
  }

  return true;
}

export async function fetchUpcomingEvents(
  data: UpcomingEventRequest,
): Promise<UpcomingEventResponse[]> {
  const res = await serverFetch("events/map", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
  const result = await res.json();
  return result.data.content;
}

export async function exportEventAttendees(eventId: string): Promise<Blob> {
  const response = await clientFetch(`events/${eventId}/attendees/export`);
  if (!response.ok) {
    throw new Error("Failed to export attendees");
  }
  return await response.blob();
}

export interface CheckInResponse {
  firstTime: boolean;
  message: string;
  attendee: {
    userId: string;
    fullName: string;
    email: string;
    checkInAt: string;
  };
}

export async function checkInAttendee(
  eventId: string,
  attendeeId: string,
): Promise<{ success: boolean; message: string | null; data: CheckInResponse }> {
  const response = await clientFetch(`events/${eventId}/attendees/${attendeeId}/check-in`, {
    method: "POST",
  });
  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to check in attendee");
  }
  return await response.json();
}






