// Mock implementation of services/api/event.service.ts.
// Same exported names and compatible signatures (unused trailing parameters
// such as tokens are omitted). Raw fixtures are converted with the same
// mappers the real service uses (lib/event-map.mapper.ts).

import type {
  CheckInResponse,
  CreateEventRequest,
  EventListResult,
  EventParams,
} from "@/services/api/event.service";
import type {
  ApiEventDetail,
  EventCommentComponent,
  EventDetail,
  EventRatingComponent,
  EventReply,
  JoinEventResult,
  MapEvent,
  OrgProfile,
  UpcomingEventRequest,
  UpcomingEventResponse,
  UserProfile,
} from "@/types/event.type";
import type { EventManagement } from "@/types/organizer.type";
import {
  mapApiCommentComponent,
  mapApiEventDetail,
  mapApiEvents,
  mapApiRatingComponent,
  mapApiReplyComponent,
} from "@/lib/event-map.mapper";
import { publishedActivities } from "@/mocks/activities.mock";
import { addMockAttendee, attendeesOfEvent, findAttendee } from "@/mocks/attendees.mock";
import { findMockAccount, findMockOrganization } from "@/mocks/auth.mock";
import { mockCategoryName, type MockCategoryName } from "@/mocks/categories.mock";
import {
  addMockComment,
  findMockComment,
  mockComments,
  removeMockComment,
  repliesOf,
  toApiComment,
  topLevelComments,
} from "@/mocks/comments.mock";
import {
  eventsOfOrganization,
  findMockEvent,
  hasEventFlag,
  isPublicEvent,
  mockEvents,
  toApiEventDetail,
  toApiMapEvent,
  toEventManagement,
  toggleEventFlag,
  toUpcomingEventResponse,
  type MockEventRecord,
} from "@/mocks/events.mock";
import { isUserFavoritedBy, toggleUserFavorite, userFavoriteCount } from "@/mocks/favorites.mock";
import { findMockOrganizationProfile, organizationFavoriteCount } from "@/mocks/organizer.mock";
import { createPendingPayment, MOCK_PAYMENT_CURRENCY } from "@/mocks/payments.mock";
import { ratingsOfEvent, ratingSummaryOf, toApiRating, upsertMockRating } from "@/mocks/ratings.mock";
import { getMockViewer } from "@/mocks/session";
import { apiErrorResponse, cursorPage, logMockWrite, mockRequest, nextMockId, offsetPage } from "@/mocks/utils";

export { filterByPolygon, formatDateString } from "@/services/api/event.service";

/** Placeholder cover for events created in mock mode (cover uploads are unavailable). */
const MOCK_NEW_EVENT_COVER = "/images/default-fallback-image.png";
const ORG_EVENTS_PAGE_SIZE = 10;

// ── Helpers ──────────────────────────────────────────────────

interface Viewer {
  userId: string | null;
  orgId: string | null;
  /** Who acts: the organization in org mode, otherwise the user. */
  actorId: string | null;
}

async function viewer(): Promise<Viewer> {
  const v = await getMockViewer();
  return { userId: v?.userId ?? null, orgId: v?.orgId ?? null, actorId: v?.orgId ?? v?.userId ?? null };
}

function normalize(value: string | null | undefined): string {
  return (value ?? "").replace(/_/g, " ").trim().toLowerCase();
}

function dayBoundary(value: string, end: boolean): number {
  const iso = value.includes("T") ? value : `${value}T${end ? "23:59:59.999" : "00:00:00"}`;
  return new Date(iso).getTime();
}

/** Applies the GET /events query params the UI sends. */
function matchesParams(e: MockEventRecord, params: EventParams): boolean {
  const search = normalize(params.search);
  if (search && !normalize(`${e.title} ${e.description}`).includes(search)) return false;
  if (params.province && normalize(params.province) !== normalize(e.province)) return false;
  if (params.district && !normalize(e.address.district).includes(normalize(params.district))) return false;
  if (params.commune && !normalize(e.address.commune).includes(normalize(params.commune))) return false;
  if (params.categoryIds?.length && !params.categoryIds.includes(e.categoryId)) return false;
  // startFrom keeps events still running on/after that day; endAt keeps events starting by that day.
  if (params.startFrom && new Date(e.endAt).getTime() < dayBoundary(params.startFrom, false)) return false;
  if (params.endAt && new Date(e.startAt).getTime() > dayBoundary(params.endAt, true)) return false;
  return true;
}

function publicEvents(params: EventParams): MockEventRecord[] {
  return mockEvents
    .filter((e) => isPublicEvent(e) && matchesParams(e, params))
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

function isOwner(e: MockEventRecord, v: Viewer): boolean {
  return v.orgId ? e.orgId === v.orgId : !!v.userId && e.userId === v.userId;
}

function detailOf(e: MockEventRecord, actorId: string | null): ApiEventDetail {
  const ratings = ratingsOfEvent(e.eventId);
  return {
    ...toApiEventDetail(e, actorId),
    ratingCount: ratings.length,
    ratings: ratings.slice(0, 3).map((r) => toApiRating(r, ratings.length)),
    ratingSummary: ratingSummaryOf(e.eventId),
  };
}

function eventCommentCount(eventId: string): number {
  return mockComments.filter((c) => c.target === "event" && c.targetId === eventId).length;
}

function addressOf(address: CreateEventRequest["address"]): MockEventRecord["address"] {
  if (typeof address === "string") return { district: "", commune: "", specificAddr: address };
  return { ...address };
}

function applyEventRequest(e: MockEventRecord, data: CreateEventRequest): void {
  e.title = data.title;
  e.description = data.description;
  e.categoryId = data.categoryId;
  e.categoryName = mockCategoryName(data.categoryId) as MockCategoryName;
  e.capacity = data.capacity || null;
  e.startAt = new Date(data.startAt).toISOString();
  e.endAt = new Date(data.endAt).toISOString();
  e.price = data.price;
  e.address = addressOf(data.address);
  e.latitude = data.latitude;
  e.longitude = data.longitude;
  e.province = data.province;
  if (data.agenda) e.agenda = structuredClone(data.agenda);
}

function validateEventRequest(data: CreateEventRequest): void {
  const errors: Record<string, string> = {};
  if (!data.title?.trim()) errors.title = "Title is required";
  if (!data.startAt) errors.startAt = "Start date is required";
  if (!data.endAt) errors.endAt = "End date is required";
  if (data.startAt && data.endAt && new Date(data.endAt) < new Date(data.startAt)) {
    errors.endAt = "End date must be after start date";
  }
  if (Object.keys(errors).length) throw apiErrorResponse(400, "Validation failed", errors);
}

async function insertEvent(data: CreateEventRequest): Promise<{ eventId: string }> {
  const v = await viewer();
  if (!v.userId) throw apiErrorResponse(401, "Please log in to create events.");
  validateEventRequest(data);

  const record: MockEventRecord = {
    eventId: nextMockId("3"),
    title: "",
    description: "",
    categoryName: "Community",
    categoryId: "",
    cover: MOCK_NEW_EVENT_COVER,
    province: "",
    address: { district: "", commune: "", specificAddr: "" },
    latitude: 0,
    longitude: 0,
    price: 0,
    capacity: null,
    startAt: "",
    endAt: "",
    status: "Pending",
    rejectedReason: null,
    reviewedAt: null,
    orgId: v.orgId,
    userId: v.orgId ? null : v.userId,
    likeCount: 0,
    commentCount: 0,
    ratingCount: 0,
    reportCount: 0,
    averageRating: 0,
    attendeeCount: 0,
    agenda: {},
    createdAt: new Date().toISOString(),
  };
  applyEventRequest(record, data);
  mockEvents.push(record);
  logMockWrite("createEvent (status Pending, placeholder cover)", { eventId: record.eventId });
  return { eventId: record.eventId };
}

async function changeEvent(eventId: string, data: CreateEventRequest): Promise<{ eventId: string }> {
  const v = await viewer();
  const e = findMockEvent(eventId);
  if (!e) throw apiErrorResponse(404, "Event not found");
  if (!isOwner(e, v)) throw apiErrorResponse(403, "You can only edit your own events.");
  validateEventRequest(data);
  applyEventRequest(e, data);
  logMockWrite("updateEvent", { eventId });
  return { eventId };
}

async function removeEvent(eventId: string): Promise<void> {
  const v = await viewer();
  const index = mockEvents.findIndex((e) => e.eventId === eventId);
  if (index === -1) throw apiErrorResponse(404, "Event not found");
  if (!isOwner(mockEvents[index], v)) throw apiErrorResponse(403, "You can only delete your own events.");
  mockEvents.splice(index, 1);
  logMockWrite("deleteEvent", { eventId });
}

// ============================================================
// READ SERVICES
// ============================================================

export async function getAllEvents(params: EventParams = {}): Promise<MapEvent[]> {
  await mockRequest("event.list");
  const { actorId } = await viewer();
  const startFrom = params.startFrom ?? new Date().toISOString().slice(0, 10);
  return mapApiEvents(
    publicEvents({ ...params, startFrom })
      .slice(0, 100)
      .map((e) => toApiMapEvent(e, actorId)),
  );
}

export async function getEventList(params: EventParams = {}): Promise<EventListResult> {
  await mockRequest("event.list");
  const { actorId } = await viewer();
  const startFrom = params.startFrom ?? new Date().toISOString().slice(0, 10);
  const page = cursorPage(publicEvents({ ...params, startFrom }), params.cursor, params.size ?? 20);
  return {
    events: mapApiEvents(page.content.map((e) => toApiMapEvent(e, actorId))),
    nextCursor: page.nextCursor,
    hasNext: page.hasNext,
  };
}

export async function getEventDetail(eventId: string): Promise<EventDetail | null> {
  await mockRequest("event.detail");
  const e = findMockEvent(eventId);
  if (!e) return null;
  const v = await viewer();
  const detail = mapApiEventDetail(detailOf(e, v.actorId));
  if (isOwner(e, v)) detail.joined = attendeesOfEvent(eventId).length;
  return detail;
}

export async function getEventAttendeesPreview(
  eventId: string,
): Promise<Array<{ userId: string; fullName: string; email: string; checkInAt: string | null }>> {
  await mockRequest("event.attendees");
  return attendeesOfEvent(eventId).map(({ userId, fullName, email, checkInAt }) => ({
    userId,
    fullName,
    email,
    checkInAt,
  }));
}

export async function getEventComments(
  eventId: string,
  cursor: string | null = null,
  limit: number = 5,
): Promise<EventCommentComponent> {
  await mockRequest("event.comments");
  const page = cursorPage(topLevelComments("event", eventId).map(toApiComment), cursor, limit);
  return mapApiCommentComponent(page);
}

export async function getCommentReplies(
  commentId: string,
  cursor: string | null = null,
  limit: number = 5,
): Promise<{ replies: EventReply[]; nextCursor: string | null; hasNext: boolean }> {
  await mockRequest("event.comments");
  const page = cursorPage(repliesOf(commentId).map(toApiComment), cursor, limit);
  return mapApiReplyComponent(page);
}

export async function getEventRatings(eventId: string, page = 1, size = 20): Promise<EventRatingComponent> {
  await mockRequest("event.ratings");
  const ratings = ratingsOfEvent(eventId);
  const apiPage = offsetPage(
    ratings.map((r) => toApiRating(r, ratings.length)),
    page,
    size,
  );
  return mapApiRatingComponent(apiPage);
}

export async function getOrgProfile(orgId: string): Promise<OrgProfile | null> {
  await mockRequest("event.orgProfile");
  const org = findMockOrganizationProfile(orgId);
  if (!org) return null;
  const { actorId } = await viewer();
  return {
    id: org.orgId,
    name: org.name,
    avatarUrl: org.logo ?? null,
    about: org.about,
    phone: org.phone,
    website: org.website,
    province: org.province,
    badges: structuredClone(org.badge),
    eventCount: eventsOfOrganization(orgId).filter(isPublicEvent).length,
    activityCount: publishedActivities().filter((a) => a.orgId === orgId).length,
    favoriteCount: organizationFavoriteCount(org),
    isFavorite: !!actorId && org.favoritedBy.has(actorId),
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  await mockRequest("event.userProfile");
  const account = findMockAccount(userId);
  if (!account) return null;
  const { actorId } = await viewer();
  const org = findMockOrganization(account.orgId);
  return {
    id: account.userId,
    name: account.fullName,
    avatarUrl: account.avatar ?? null,
    badges: [],
    favoriteCount: userFavoriteCount(userId),
    activityCount: publishedActivities().filter((a) => a.userId === userId && !a.orgId).length,
    createdEventCount: mockEvents.filter((e) => e.userId === userId).length,
    orgId: org?.orgId ?? null,
    orgName: org?.name ?? null,
    orgLogo: org?.logo ?? null,
    isFavorite: isUserFavoritedBy(userId, actorId),
  };
}

// ============================================================
// WRITE SERVICES (in-memory)
// ============================================================

export async function toggleLikeService(eventId: string): Promise<boolean> {
  await mockRequest("event.like");
  const e = findMockEvent(eventId);
  const { actorId } = await viewer();
  if (!e || !actorId) return false;
  const liked = toggleEventFlag("liked", actorId, eventId);
  e.likeCount = Math.max(0, e.likeCount + (liked ? 1 : -1));
  logMockWrite("toggleLikeEvent", { eventId, liked });
  return true;
}

export async function toggleSaveService(eventId: string): Promise<{ success: boolean; message: string }> {
  await mockRequest("event.save");
  const { actorId } = await viewer();
  if (!findMockEvent(eventId) || !actorId) {
    return { success: false, message: "Failed to update save status." };
  }
  const saved = toggleEventFlag("saved", actorId, eventId);
  logMockWrite("toggleSaveEvent", { eventId, saved });
  return { success: true, message: saved ? "Event saved" : "Event removed from saved" };
}

export async function reportEventService(
  eventId: string,
  reason: string,
  details: string,
): Promise<{ success: boolean; message: string }> {
  await mockRequest("event.report");
  const e = findMockEvent(eventId);
  if (!e) return { success: false, message: "Failed to submit report." };
  e.reportCount += 1;
  logMockWrite("reportEvent", { eventId, reason, details });
  return { success: true, message: "Event reported successfully" };
}

export async function rateEventService(
  eventId: string,
  score: 1 | 2 | 3 | 4 | 5,
  review: string,
): Promise<{ success: boolean; message: string }> {
  await mockRequest("event.rate");
  const e = findMockEvent(eventId);
  const { userId } = await viewer();
  if (!e || !userId) return { success: false, message: "Failed to submit rating." };
  upsertMockRating(eventId, userId, score, review);
  const summary = ratingSummaryOf(eventId);
  e.ratingCount = summary?.total ?? 0;
  e.averageRating = summary?.average ?? 0;
  logMockWrite("rateEvent", { eventId, score });
  return { success: true, message: "Rating submitted successfully" };
}

export async function joinEventService(
  eventId: string,
): Promise<{ data: JoinEventResult | null; message: string }> {
  await mockRequest("event.join");
  const e = findMockEvent(eventId);
  const { userId } = await viewer();
  if (!e || !userId) return { data: null, message: "Failed to join event." };
  if (hasEventFlag("joined", userId, eventId)) {
    return { data: null, message: "You have already joined this event." };
  }
  if (e.capacity && e.attendeeCount >= e.capacity) {
    return { data: null, message: "This event is full." };
  }

  if (e.price > 0) {
    // Paid: registration completes once checkPaymentStatusService reports paid.
    const payment = createPendingPayment(eventId, userId, e.price);
    logMockWrite("joinEvent (awaiting mock payment)", { eventId, md5: payment.md5 });
    return {
      data: {
        requiresPayment: true,
        attendeeId: null,
        ticketQr: null,
        bakongQrString: payment.qrString,
        bakongQrImage: null,
        md5: payment.md5,
        currency: MOCK_PAYMENT_CURRENCY,
      },
      message: "Please complete the payment to join",
    };
  }

  const attendee = addMockAttendee(eventId, userId);
  toggleEventFlag("joined", userId, eventId);
  e.attendeeCount += 1;
  logMockWrite("joinEvent", { eventId, attendeeId: attendee.attendeeId });
  return {
    data: {
      requiresPayment: false,
      attendeeId: attendee.attendeeId,
      // The real backend returns a base64 PNG ticket; mock mode has no QR generator.
      ticketQr: null,
      bakongQrString: null,
      bakongQrImage: null,
      md5: null,
      currency: null,
    },
    message: "Joined event successfully",
  };
}

export async function postCommentService(eventId: string, content: string): Promise<string | null> {
  await mockRequest("event.comment");
  const e = findMockEvent(eventId);
  const v = await viewer();
  if (!e || !v.userId || !content.trim()) return null;
  const comment = addMockComment({
    target: "event",
    targetId: eventId,
    parentId: null,
    content,
    userId: v.userId,
    orgId: v.orgId,
  });
  e.commentCount = eventCommentCount(eventId);
  logMockWrite("postEventComment", { eventId, commentId: comment.commentId });
  return comment.commentId;
}

export async function postReplyService(commentId: string, content: string): Promise<string | null> {
  await mockRequest("event.comment");
  const parent = findMockComment(commentId);
  const v = await viewer();
  if (!parent || !v.userId || !content.trim()) return null;
  const reply = addMockComment({
    target: parent.target,
    targetId: parent.targetId,
    parentId: parent.commentId,
    content,
    userId: v.userId,
    orgId: v.orgId,
  });
  const e = findMockEvent(parent.targetId);
  if (e) e.commentCount = eventCommentCount(e.eventId);
  logMockWrite("postEventReply", { parentId: commentId, commentId: reply.commentId });
  return reply.commentId;
}

export async function editCommentService(
  commentId: string,
  content: string,
): Promise<{ data: string | null; message: string }> {
  await mockRequest("event.comment");
  const comment = findMockComment(commentId);
  const v = await viewer();
  if (!comment) return { data: null, message: "Comment not found." };
  const isAuthor = v.orgId ? comment.orgId === v.orgId : comment.userId === v.userId && !comment.orgId;
  if (!isAuthor) return { data: null, message: "You can only edit your own comments." };
  comment.content = content;
  comment.isEdited = true;
  logMockWrite("editEventComment", { commentId });
  return { data: commentId, message: "Comment updated successfully" };
}

export async function deleteCommentService(commentId: string): Promise<{ success: boolean; message: string }> {
  await mockRequest("event.comment");
  const comment = findMockComment(commentId);
  const v = await viewer();
  if (!comment) return { success: false, message: "Comment not found." };
  const isAuthor = v.orgId ? comment.orgId === v.orgId : comment.userId === v.userId && !comment.orgId;
  if (!isAuthor) return { success: false, message: "You can only delete your own comments." };
  removeMockComment(commentId);
  const e = findMockEvent(comment.targetId);
  if (e) e.commentCount = eventCommentCount(e.eventId);
  logMockWrite("deleteEventComment", { commentId });
  return { success: true, message: "Comment deleted successfully" };
}

export async function toggleFavoriteOrgService(orgId: string): Promise<{ success: boolean; message: string }> {
  await mockRequest("event.favorite");
  const org = findMockOrganizationProfile(orgId);
  const { actorId } = await viewer();
  if (!org || !actorId || actorId === orgId) {
    return { success: false, message: "Failed to update favorite status." };
  }
  const added = !org.favoritedBy.has(actorId);
  if (added) org.favoritedBy.add(actorId);
  else org.favoritedBy.delete(actorId);
  logMockWrite("toggleFavoriteOrganization", { orgId, added });
  return { success: true, message: added ? "Added to favorites" : "Removed from favorites" };
}

export async function toggleFavoriteUserService(userId: string): Promise<{ success: boolean; message: string }> {
  await mockRequest("event.favorite");
  const { actorId } = await viewer();
  if (!findMockAccount(userId) || !actorId || actorId === userId) {
    return { success: false, message: "Failed to update favorite status." };
  }
  const added = toggleUserFavorite(actorId, userId);
  logMockWrite("toggleFavoriteUser", { userId, added });
  return { success: true, message: added ? "Added to favorites" : "Removed from favorites" };
}

export async function createEventService(data: CreateEventRequest): Promise<{ eventId: string }> {
  await mockRequest("event.create");
  return insertEvent(data);
}

export async function updateEventService(eventId: string, data: CreateEventRequest): Promise<{ eventId: string }> {
  await mockRequest("event.update");
  return changeEvent(eventId, data);
}

export async function deleteEventService(eventId: string): Promise<void> {
  await mockRequest("event.delete");
  await removeEvent(eventId);
}

export async function createEvent(data: CreateEventRequest): Promise<{ eventId: string }> {
  await mockRequest("event.create");
  return insertEvent(data);
}

export async function updateEvent(eventId: string, data: CreateEventRequest): Promise<{ eventId: string }> {
  await mockRequest("event.update");
  return changeEvent(eventId, data);
}

export async function uploadEventCover(): Promise<{ coverUrl: string }> {
  await mockRequest("event.cover");
  throw new Error("Uploading an event cover is not available in mock mode (no media storage).");
}

export async function fetchEventDetails(eventId: string): Promise<ApiEventDetail> {
  await mockRequest("event.detail");
  const e = findMockEvent(eventId);
  if (!e) throw new Error("Failed to fetch event details: Event not found");
  const { actorId } = await viewer();
  return detailOf(e, actorId);
}

export async function fetchOrganizationEvents(
  orgId: string,
  cursor?: string,
): Promise<{ content: EventManagement[]; nextCursor: string | null; hasNext: boolean }> {
  await mockRequest("event.orgEvents");
  return cursorPage(eventsOfOrganization(orgId).map(toEventManagement), cursor, ORG_EVENTS_PAGE_SIZE);
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  await mockRequest("event.delete");
  await removeEvent(eventId).catch(async (err: unknown) => {
    const detail = err instanceof Response ? ((await err.json()) as { detail?: string }).detail : String(err);
    throw new Error(`Failed to delete event: ${detail}`);
  });
  return true;
}

export async function fetchUpcomingEvents(data: UpcomingEventRequest): Promise<UpcomingEventResponse[]> {
  await mockRequest("event.upcoming");
  const { actorId } = await viewer();
  const events = publicEvents({
    search: data.search || null,
    categoryIds: data.categoryIds,
    startFrom: data.startFrom || null,
    endAt: data.endAt || null,
  });
  return cursorPage(events, data.cursor || null, data.size || 10).content.map((e) =>
    toUpcomingEventResponse(e, actorId),
  );
}

export async function exportEventAttendees(eventId: string): Promise<Blob> {
  await mockRequest("event.export");
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = attendeesOfEvent(eventId).map((a) =>
    [a.fullName, a.email, a.checkInAt ?? ""].map(escape).join(","),
  );
  // Column layout is the mock's own; the real export format may differ.
  return new Blob([["Full Name,Email,Checked In At", ...rows].join("\n")], { type: "text/csv" });
}

export async function checkInAttendee(
  eventId: string,
  attendeeId: string,
): Promise<{ success: boolean; message: string | null; data: CheckInResponse }> {
  await mockRequest("event.checkIn");
  const attendee = findAttendee(eventId, attendeeId);
  if (!attendee) throw new Error("Attendee not found for this event");
  const firstTime = !attendee.checkInAt;
  if (firstTime) attendee.checkInAt = new Date().toISOString();
  const message = firstTime ? "Checked in successfully" : "Attendee already checked in";
  logMockWrite("checkInAttendee", { eventId, attendeeId: attendee.attendeeId, firstTime });
  return {
    success: true,
    message,
    data: {
      firstTime,
      message,
      attendee: {
        userId: attendee.userId,
        fullName: attendee.fullName,
        email: attendee.email,
        checkInAt: attendee.checkInAt!,
      },
    },
  };
}
