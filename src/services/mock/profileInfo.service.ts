// Mock implementation of services/api/profileInfo.service.ts.
// Same exported names and compatible signatures (unused trailing parameters
// such as tokens are omitted); data comes from src/mocks. Writes change
// in-memory state only; media uploads are rejected rather than faked.

import type { ApiRes, AppBaseCategoryType, CursorData } from "@/types/common.type";
import type { ActivitiesResponse } from "@/types/activity.type";
import type {
  AttendedEvent,
  CreatedEvent,
  EventProfileRespone,
  SavedEvent,
  WalletEventList,
} from "@/types/event.type";
import type { BaseProfileInfo, FavoriteUserlist, ProfileInfoType } from "@/types/user.type";
import type { PersonalInfoFormValues } from "@/types/schemas/profile.schema";
import type { EventAppStatus } from "@/components/profile/FilterEventComponent";
import type { CreateOrgPayload } from "@/services/api/profileInfo.service";
import {
  findMockAccount,
  findMockOrganization,
  MOCK_PASSWORD,
} from "@/mocks/auth.mock";
import { mockActivities, activityIdsWithFlag, findMockActivity, type MockActivityRecord } from "@/mocks/activities.mock";
import {
  eventIdsWithFlag,
  findMockEvent,
  hasEventFlag,
  mockEvents,
  toggleEventFlag,
  type MockEventRecord,
} from "@/mocks/events.mock";
import { toRawGalleryItem } from "@/mocks/gallery.mock";
import { findMockOrganizationProfile, organizationFavoriteCount } from "@/mocks/organizer.mock";
import {
  favoriteCreatedAt,
  favoriteOrganizationIds,
  favoriteUserIds,
  isUserFavoritedBy,
  mockOrganizerRequests,
  mockUserBadges,
  toggleOrganizationFavorite,
  toggleUserFavorite,
  userFavoriteCount,
} from "@/mocks/profile.mock";
import { getMockViewer } from "@/mocks/session";
import { apiRes, cursorPage, logMockWrite, mockId, mockRequest, nextMockId } from "@/mocks/utils";

/** Page size for profile tab lists (the real endpoints take only a cursor). */
const PROFILE_PAGE_SIZE = 8;

const UPLOAD_UNAVAILABLE = "is not available in mock mode (no media storage).";

// ── Helpers ──────────────────────────────────────────────────

/** Who is acting: the organization in org mode, otherwise the user. */
async function viewerActorId(): Promise<string | null> {
  const viewer = await getMockViewer();
  return viewer?.orgId ?? viewer?.userId ?? null;
}

async function requireViewerActor(): Promise<string> {
  const actor = await viewerActorId();
  if (!actor) throw new Error("API Error 401: Unauthorized");
  return actor;
}

function notFound(what: string): Error {
  return new Error(`API Error 404: ${what} not found`);
}

/** Moderation status → the status vocabulary of /users/{id}/events/created. */
function createdStatus(e: MockEventRecord): EventAppStatus {
  return e.status === "Approved" ? "Published" : e.status;
}

function toEventProfile(e: MockEventRecord, actorId: string | null): EventProfileRespone {
  return {
    eventId: e.eventId,
    title: e.title,
    province: e.province,
    price: e.price,
    description: e.description,
    image: e.cover,
    startAt: e.startAt,
    endAt: e.endAt,
    categoryName: e.categoryName as AppBaseCategoryType,
    rating: e.averageRating,
    isLiked: hasEventFlag("liked", actorId, e.eventId),
    isSaved: hasEventFlag("saved", actorId, e.eventId),
  };
}

function toCreatedEvent(e: MockEventRecord, actorId: string | null): CreatedEvent {
  return { ...toEventProfile(e, actorId), status: createdStatus(e) };
}

function toSavedEvent(e: MockEventRecord, actorId: string | null): SavedEvent {
  return {
    ...toEventProfile(e, actorId),
    location: [e.address.specificAddr, e.address.commune, e.address.district].filter(Boolean).join(", "),
  };
}

function toActivitiesResponse(a: MockActivityRecord): ActivitiesResponse | null {
  const item = toRawGalleryItem(a);
  if (!item) return null;
  return {
    activityId: item.activityId,
    previewUrl: item.previewUrl,
    mediaType: item.mediaType,
    // The UI reads this with Number(); the frontend type declares a string.
    durations: item.durations == null ? null : String(item.durations),
    hasMore: item.hasMore,
    createdAt: item.createdAt,
  };
}

function eventsByIds(ids: string[]): MockEventRecord[] {
  return ids
    .map(findMockEvent)
    .filter((e): e is MockEventRecord => Boolean(e))
    .sort((a, b) => b.startAt.localeCompare(a.startAt));
}

function page<T>(items: T[], cursor?: string | null): CursorData<T> {
  const p = cursorPage(items, cursor, PROFILE_PAGE_SIZE);
  return { content: p.content, nextCursor: p.nextCursor, hasNext: p.hasNext };
}

// ── List builders shared by the server tabs and client "load more" ──

function attendedEvents(userId: string, actorId: string | null): EventProfileRespone[] {
  return eventsByIds(eventIdsWithFlag("joined", userId)).map((e) => toEventProfile(e, actorId));
}

function createdEvents(profileId: string, isOrg: boolean, actorId: string | null, status?: string): CreatedEvent[] {
  return mockEvents
    .filter((e) => (isOrg ? e.orgId === profileId : e.userId === profileId && !e.orgId))
    .filter((e) => !status || createdStatus(e) === status)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((e) => toCreatedEvent(e, actorId));
}

function authoredActivities(profileId: string, isOrg: boolean, actorId: string | null): ActivitiesResponse[] {
  return mockActivities
    .filter((a) => (isOrg ? a.orgId === profileId : a.userId === profileId && !a.orgId))
    // Drafts are only visible to their author.
    .filter((a) => a.isPublished || actorId === profileId)
    .map(toActivitiesResponse)
    .filter((a): a is ActivitiesResponse => a !== null);
}

function savedEvents(ownerId: string, actorId: string | null): SavedEvent[] {
  return eventsByIds(eventIdsWithFlag("saved", ownerId)).map((e) => toSavedEvent(e, actorId));
}

function savedActivities(ownerId: string): ActivitiesResponse[] {
  return activityIdsWithFlag("saved", ownerId)
    .map(findMockActivity)
    .filter((a): a is MockActivityRecord => Boolean(a))
    .map(toActivitiesResponse)
    .filter((a): a is ActivitiesResponse => a !== null);
}

function favoritesOf(actorId: string): FavoriteUserlist[] {
  const users = favoriteUserIds(actorId).flatMap((id): FavoriteUserlist[] => {
    const account = findMockAccount(id);
    if (!account) return [];
    return [
      {
        entityId: account.userId,
        image: account.avatar ?? "",
        name: account.fullName,
        favoriteCount: userFavoriteCount(account.userId),
        // `entity` and `bookmarkId` are required by the frontend type.
        entity: "User",
        entityType: "User",
        createdAt: favoriteCreatedAt(actorId, account.userId),
        bookmarkId: "",
      },
    ];
  });
  const orgs = favoriteOrganizationIds(actorId).flatMap((id): FavoriteUserlist[] => {
    const org = findMockOrganizationProfile(id);
    if (!org) return [];
    return [
      {
        entityId: org.orgId,
        image: org.logo,
        name: org.name,
        favoriteCount: organizationFavoriteCount(org),
        entity: "Organizer",
        entityType: "Organizer",
        createdAt: favoriteCreatedAt(actorId, org.orgId),
        bookmarkId: "",
      },
    ];
  });
  return [...users, ...orgs]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((item, i) => ({ ...item, bookmarkId: mockId("b", i + 1) }));
}

function buildUserProfile(userId: string, actorId: string | null): BaseProfileInfo {
  const account = findMockAccount(userId);
  if (!account) throw notFound("User");
  return {
    userId: account.userId,
    fullName: account.fullName,
    avatar: account.avatar,
    bio: account.bio,
    gender: account.gender,
    activityCount: mockActivities.filter((a) => a.userId === userId && !a.orgId && a.isPublished).length,
    favoriteCount: userFavoriteCount(userId),
    badge: mockUserBadges[userId] ?? [],
    isFavorite: isUserFavoritedBy(userId, actorId),
    isOrganizer: Boolean(account.orgId),
    role: account.role,
    orgId: account.orgId,
    createdEventCount: mockEvents.filter((e) => e.userId === userId && !e.orgId && e.status === "Approved").length,
    hasOrg: Boolean(account.orgId) || mockOrganizerRequests.some((r) => r.requestedBy === userId),
  };
}

function buildOrgProfile(orgId: string, actorId: string | null): ProfileInfoType {
  const org = findMockOrganizationProfile(orgId);
  if (!org) throw notFound("Organization");
  return {
    userId: org.orgId,
    fullName: org.name,
    avatar: org.logo ?? null,
    bio: org.about ?? null,
    phone: org.phone ?? null,
    website: org.website ?? null,
    province: org.province ?? null,
    favoriteCount: organizationFavoriteCount(org),
    activityCount: mockActivities.filter((a) => a.orgId === orgId && a.isPublished).length,
    createdEventCount: mockEvents.filter((e) => e.orgId === orgId && e.status === "Approved").length,
    badge: org.badge,
    isOrganizer: true,
    isFavorite: actorId ? org.favoritedBy.has(actorId) : false,
  };
}

// ── Profiles ─────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<ApiRes<ProfileInfoType>> {
  await mockRequest("profile.get");
  return apiRes(buildUserProfile(userId, await viewerActorId()));
}

export async function getOrgProfile(orgId: string): Promise<ApiRes<ProfileInfoType>> {
  await mockRequest("profile.org");
  return apiRes(buildOrgProfile(orgId, await viewerActorId()));
}

export async function getPersonalProfile(userId: string): Promise<BaseProfileInfo> {
  await mockRequest("profile.personal");
  return buildUserProfile(userId, await viewerActorId());
}

export async function getPersonalOrgProfile(orgId: string): Promise<{
  fullName: string;
  bio: string;
  phone: string;
  website: string;
}> {
  await mockRequest("profile.personalOrg");
  const org = findMockOrganizationProfile(orgId);
  if (!org) throw notFound("Organization");
  return { fullName: org.name ?? "", bio: org.about ?? "", phone: org.phone ?? "", website: org.website ?? "" };
}

export async function updateUserProfile(form: PersonalInfoFormValues): Promise<ApiRes<BaseProfileInfo>> {
  await mockRequest("profile.update");
  const viewer = await getMockViewer();
  const account = findMockAccount(viewer?.userId);
  if (!account) throw new Error("API Error 401: Unauthorized");
  account.fullName = form.fullName;
  if (form.gender) account.gender = form.gender;
  account.bio = form.bio ?? "";
  logMockWrite("updateUserProfile", { userId: account.userId });
  return apiRes(buildUserProfile(account.userId, account.userId), "Profile updated");
}

export async function updateOrgProfile(orgId: string, form: PersonalInfoFormValues): Promise<void> {
  await mockRequest("profile.updateOrg");
  const org = findMockOrganizationProfile(orgId);
  if (!org) throw notFound("Organization");
  org.name = form.fullName;
  org.about = form.bio ?? "";
  org.phone = form.phone ?? "";
  org.website = form.website ?? "";
  // Keep the identity used for comment/post authors in sync.
  const identity = findMockOrganization(orgId);
  if (identity) identity.name = form.fullName;
  logMockWrite("updateOrgProfile", { orgId });
}

// ── Profile tabs (server-rendered first page) ────────────────

export async function getOwnActivities(userId: string): Promise<ActivitiesResponse[]> {
  await mockRequest("profile.activities");
  return authoredActivities(userId, false, await viewerActorId());
}

export async function getAttendedEvents(userId: string): Promise<ApiRes<CursorData<EventProfileRespone>>> {
  await mockRequest("profile.attended");
  return apiRes(page(attendedEvents(userId, await viewerActorId())));
}

export async function getCreatedEvents(userId: string, status?: string): Promise<ApiRes<CursorData<CreatedEvent>>> {
  await mockRequest("profile.created");
  return apiRes(page(createdEvents(userId, false, await viewerActorId(), status)));
}

export async function getOrgCreatedEvents(orgId: string): Promise<ApiRes<CursorData<CreatedEvent>>> {
  await mockRequest("profile.orgCreated");
  return apiRes(page(createdEvents(orgId, true, await viewerActorId())));
}

export async function getAttendedEventDetails(userId: string): Promise<ApiRes<CursorData<AttendedEvent>>> {
  await mockRequest("profile.attended");
  return apiRes(page(attendedEvents(userId, await viewerActorId())));
}

export async function getActivities(userId: string): Promise<ApiRes<CursorData<ActivitiesResponse>>> {
  await mockRequest("profile.activities");
  return apiRes(page(authoredActivities(userId, false, await viewerActorId())));
}

export async function getOrgActivities(orgId: string): Promise<ApiRes<CursorData<ActivitiesResponse>>> {
  await mockRequest("profile.activities");
  return apiRes(page(authoredActivities(orgId, true, await viewerActorId())));
}

export async function getFavoriteUser(userId: string): Promise<ApiRes<CursorData<FavoriteUserlist>>> {
  await mockRequest("profile.favorites");
  return apiRes(page(favoritesOf(userId)));
}

export async function getOrgFavoriteUser(orgId: string): Promise<ApiRes<CursorData<FavoriteUserlist>>> {
  await mockRequest("profile.favorites");
  return apiRes(page(favoritesOf(orgId)));
}

export async function getSavedEvents(userId: string): Promise<ApiRes<CursorData<SavedEvent>>> {
  await mockRequest("profile.saved");
  return apiRes(page(savedEvents(userId, await viewerActorId())));
}

export async function getOrgSavedEvents(orgId: string): Promise<ApiRes<CursorData<SavedEvent>>> {
  await mockRequest("profile.saved");
  return apiRes(page(savedEvents(orgId, await viewerActorId())));
}

export async function getSavedActivities(userId: string): Promise<ApiRes<CursorData<ActivitiesResponse>>> {
  await mockRequest("profile.saved");
  return apiRes(page(savedActivities(userId)));
}

export async function getOrgSavedActivities(orgId: string): Promise<ApiRes<CursorData<ActivitiesResponse>>> {
  await mockRequest("profile.saved");
  return apiRes(page(savedActivities(orgId)));
}

// ── Profile tabs (client "load more") ────────────────────────

export async function getAttendedEventsPage(userId: string, cursor: string): Promise<CursorData<EventProfileRespone>> {
  await mockRequest("profile.attended");
  return page(attendedEvents(userId, await viewerActorId()), cursor);
}

export async function getCreatedEventsPage(
  profileId: string,
  cursor: string,
  isOrgProfile: boolean,
  status: string,
): Promise<CursorData<EventProfileRespone>> {
  await mockRequest("profile.created");
  const actorId = await viewerActorId();
  return page(createdEvents(profileId, isOrgProfile, actorId, isOrgProfile ? undefined : status), cursor);
}

export async function getActivitiesPage(
  profileId: string,
  cursor: string,
  isOrgProfile: boolean,
): Promise<CursorData<ActivitiesResponse>> {
  await mockRequest("profile.activities");
  return page(authoredActivities(profileId, isOrgProfile, await viewerActorId()), cursor);
}

export async function getSavedEventsPage(profileId: string, cursor: string): Promise<CursorData<EventProfileRespone>> {
  await mockRequest("profile.saved");
  return page(savedEvents(profileId, await viewerActorId()), cursor);
}

export async function getSavedActivitiesPage(profileId: string, cursor: string): Promise<CursorData<ActivitiesResponse>> {
  await mockRequest("profile.saved");
  return page(savedActivities(profileId), cursor);
}

/** Mock avatars are local /public paths, so no authenticated download is needed. */
export async function getAvatarDisplayUrl(avatar: string): Promise<string> {
  if (avatar.startsWith("/") || avatar.startsWith("blob:") || avatar.startsWith("data:")) return avatar;
  throw new Error("Failed to load image");
}

// ── Favorites, likes, saves ──────────────────────────────────

export async function toggleFavoriteUser(userId: string): Promise<ApiRes<boolean>> {
  await mockRequest("profile.favorite");
  if (!findMockAccount(userId)) throw notFound("User");
  const actor = await requireViewerActor();
  const state = toggleUserFavorite(actor, userId);
  logMockWrite("toggleFavoriteUser", { actor, userId, favorited: state });
  return apiRes(state);
}

export async function toggleOrgFavoriteUser(orgId: string): Promise<ApiRes<boolean>> {
  await mockRequest("profile.favorite");
  const actor = await requireViewerActor();
  const state = toggleOrganizationFavorite(actor, orgId);
  logMockWrite("toggleOrgFavorite", { actor, orgId, favorited: state });
  return apiRes(state);
}

export async function toggleLikeEvent(eventId: string): Promise<ApiRes<boolean>> {
  await mockRequest("profile.likeEvent");
  const event = findMockEvent(eventId);
  if (!event) throw notFound("Event");
  const liked = toggleEventFlag("liked", await requireViewerActor(), eventId);
  event.likeCount = Math.max(0, event.likeCount + (liked ? 1 : -1));
  logMockWrite("toggleLikeEvent", { eventId, liked });
  return apiRes(liked);
}

export async function toggleSaveEvent(eventId: string): Promise<void> {
  await mockRequest("profile.saveEvent");
  if (!findMockEvent(eventId)) throw notFound("Event");
  const saved = toggleEventFlag("saved", await requireViewerActor(), eventId);
  logMockWrite("toggleSaveEvent", { eventId, saved });
}

// ── Account ──────────────────────────────────────────────────

export async function updatePassword(currentPassword: string): Promise<ApiRes<boolean>> {
  await mockRequest("profile.password");
  if (currentPassword !== MOCK_PASSWORD) {
    throw new Error("API Error 400: Current password is incorrect");
  }
  // Mock logins always use MOCK_PASSWORD, so the new password is not stored.
  logMockWrite("updatePassword (accepted, not applied — mock password unchanged)");
  return apiRes(true, "Password changed");
}

export async function deleteEvent(eventId: string): Promise<void> {
  await mockRequest("profile.deleteEvent");
  const viewer = await getMockViewer();
  const index = mockEvents.findIndex((e) => e.eventId === eventId);
  if (index < 0) throw notFound("Event");
  const event = mockEvents[index];
  const isOwner = viewer?.orgId ? event.orgId === viewer.orgId : !event.orgId && event.userId === viewer?.userId;
  if (!isOwner) throw new Error("API Error 403: You can only delete your own events");
  mockEvents.splice(index, 1);
  logMockWrite("deleteEvent", { eventId });
}

export async function getPaidEvents(): Promise<ApiRes<CursorData<WalletEventList>>> {
  await mockRequest("profile.paidEvents");
  const viewer = await getMockViewer();
  if (!viewer?.orgId) throw new Error("API Error 403: Organization mode required");
  const paid = mockEvents
    .filter((e) => e.orgId === viewer.orgId && e.price > 0 && e.status === "Approved")
    .sort((a, b) => b.startAt.localeCompare(a.startAt))
    .map(
      (e): WalletEventList => ({
        eventId: e.eventId,
        title: e.title,
        cover: e.cover,
        price: e.price,
        startAt: e.startAt,
        endAt: e.endAt,
        province: e.province,
      }),
    );
  return apiRes(page(paid));
}

export async function deleteAccount(): Promise<void> {
  await mockRequest("profile.deleteAccount");
  // Fixtures are kept so the mock stays usable; callers still sign out.
  logMockWrite("deleteAccount (not applied — fixtures kept)", { userId: (await getMockViewer())?.userId });
}

export async function deleteOrgAccount(orgId: string): Promise<void> {
  await mockRequest("profile.deleteOrg");
  if (!findMockOrganizationProfile(orgId)) throw notFound("Organization");
  logMockWrite("deleteOrgAccount (not applied — fixtures kept)", { orgId });
}

// ── Organizer request ────────────────────────────────────────

export async function createOrgProfile(payload: CreateOrgPayload): Promise<string> {
  await mockRequest("profile.createOrg");
  const viewer = await getMockViewer();
  const account = findMockAccount(viewer?.userId);
  if (!account) throw new Error("Failed to create organizer (401)");
  if (account.orgId || mockOrganizerRequests.some((r) => r.requestedBy === account.userId)) {
    return "ALREADY_EXISTS";
  }
  const orgId = nextMockId("2");
  mockOrganizerRequests.push({
    orgId,
    requestedBy: account.userId,
    ...payload,
    status: "Pending",
    createdAt: new Date().toISOString(),
  });
  logMockWrite("createOrgProfile (pending request)", { orgId, name: payload.name });
  return orgId;
}

export async function requestOrgProfile(): Promise<string> {
  await mockRequest("profile.orgLogo");
  throw new Error(`Uploading an organization logo ${UPLOAD_UNAVAILABLE}`);
}

export async function uploadOrgDocument(): Promise<string> {
  await mockRequest("profile.orgDocument");
  throw new Error(`Uploading a verification document ${UPLOAD_UNAVAILABLE}`);
}

export async function patchOrgDocumentUrl(): Promise<void> {
  await mockRequest("profile.orgDocument");
  throw new Error(`Uploading a verification document ${UPLOAD_UNAVAILABLE}`);
}

// ── Avatar uploads ───────────────────────────────────────────

export async function updateAvatarClient(): Promise<ApiRes<string>> {
  await mockRequest("profile.avatar");
  throw new Error(`Uploading a profile picture ${UPLOAD_UNAVAILABLE}`);
}

export async function updateOrgAvatarClient(): Promise<ApiRes<string>> {
  await mockRequest("profile.avatar");
  throw new Error(`Uploading an organization logo ${UPLOAD_UNAVAILABLE}`);
}
