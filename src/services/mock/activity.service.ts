// Mock implementation of services/api/activity.service.ts (feed, gallery,
// post detail, activity comments). Mapping is shared with the API service via
// its exported mappers, so mock and real data render identically.
//
// Writes change in-memory state only. Media uploads are rejected with an
// explicit error because there is no storage behind mock mode.

import * as api from "@/services/api/activity.service";
import type { FeedPage, MappedPostDetail } from "@/services/api/activity.service";
import type {
  ActivityComment,
  ActivityCommentComponent,
  AttendedEventItem,
  CreateActivityData,
  CreateActivityRequest,
  GalleryData,
  RawActivityItem,
} from "@/types/activity.type";
import { mapApiActivityCommentComponent, mapApiActivityReplyComponent } from "@/lib/activity-map.mapper";
import {
  findMockActivity,
  mockActivities,
  publishedActivities,
  toggleActivityFlag,
  toRawActivityItem,
  type MockActivityRecord,
} from "@/mocks/activities.mock";
import {
  addMockComment,
  findMockComment,
  removeMockComment,
  repliesOf,
  toApiComment,
  topLevelComments,
} from "@/mocks/comments.mock";
import { eventIdsWithFlag, findMockEvent } from "@/mocks/events.mock";
import { mockGalleryItems } from "@/mocks/gallery.mock";
import { getMockViewer, type MockViewer } from "@/mocks/session";
import { cursorPage, logMockWrite, mockRequest, nextMockId } from "@/mocks/utils";

const FEED_PAGE_SIZE = 10;
const GALLERY_PAGE_SIZE = 10;
const UPLOAD_UNAVAILABLE = "Media upload is not available in mock mode (no media storage).";

/** Likes/saves are per actor: the organization in org mode, otherwise the user. */
function actorOf(viewer: MockViewer | null): string | null {
  return viewer?.orgId ?? viewer?.userId ?? null;
}

async function requireActor(): Promise<{ viewer: MockViewer; actorId: string }> {
  const viewer = await getMockViewer();
  const actorId = actorOf(viewer);
  if (!viewer || !actorId) throw new Error("You must be signed in (mock)");
  return { viewer, actorId };
}

function isAuthor(record: { userId: string | null; orgId: string | null }, viewer: MockViewer | null): boolean {
  if (!viewer) return false;
  return viewer.orgId ? record.orgId === viewer.orgId : record.userId === viewer.userId && !record.orgId;
}

function requireActivity(activityId: string): MockActivityRecord {
  const activity = findMockActivity(activityId);
  if (!activity) throw new Error(`Activity ${activityId} not found (mock)`);
  return activity;
}

// ── Comments ─────────────────────────────────────────────────

export async function getActivityComments(
  activityId: string,
  cursor: string | null = null,
  size: number = 5,
): Promise<ActivityCommentComponent> {
  await mockRequest("activity.comments");
  const page = cursorPage(topLevelComments("activity", activityId).map(toApiComment), cursor, size);
  return mapApiActivityCommentComponent(page);
}

export async function loadMoreActivityComments(
  activityId: string,
  cursor: string,
  size: number = 5,
): Promise<ActivityCommentComponent | null> {
  return getActivityComments(activityId, cursor, size);
}

export async function getActivityCommentReplies(
  commentId: string,
  cursor: string | null = null,
  size: number = 5,
): Promise<{ replies: ActivityComment[]; nextCursor: string | null; hasNext: boolean }> {
  await mockRequest("activity.replies");
  const page = cursorPage(repliesOf(commentId).map(toApiComment), cursor, size);
  return mapApiActivityReplyComponent(page);
}

export async function postActivityCommentService(activityId: string, content: string): Promise<string | null> {
  await mockRequest("activity.comment.create");
  const viewer = await getMockViewer();
  const activity = findMockActivity(activityId);
  if (!viewer || !activity) return null;
  const comment = addMockComment({
    target: "activity",
    targetId: activityId,
    parentId: null,
    content,
    userId: viewer.userId,
    orgId: viewer.orgId,
  });
  activity.commentCount += 1;
  logMockWrite("postActivityComment", { activityId });
  return comment.commentId;
}

export async function postActivityReplyService(commentId: string, content: string): Promise<string | null> {
  await mockRequest("activity.comment.reply");
  const viewer = await getMockViewer();
  const parent = findMockComment(commentId);
  if (!viewer || !parent) return null;
  const reply = addMockComment({
    target: parent.target,
    targetId: parent.targetId,
    parentId: commentId,
    content,
    userId: viewer.userId,
    orgId: viewer.orgId,
  });
  const activity = findMockActivity(parent.targetId);
  if (activity) activity.commentCount += 1;
  logMockWrite("postActivityReply", { commentId });
  return reply.commentId;
}

export async function editActivityCommentService(
  commentId: string,
  content: string,
): Promise<{ success: boolean; message: string }> {
  await mockRequest("activity.comment.edit");
  const viewer = await getMockViewer();
  const comment = findMockComment(commentId);
  if (!comment) return { success: false, message: "Comment not found." };
  if (!isAuthor(comment, viewer)) return { success: false, message: "You can only edit your own comments." };
  comment.content = content;
  comment.isEdited = true;
  logMockWrite("editActivityComment", { commentId });
  return { success: true, message: "Comment updated successfully" };
}

export async function deleteActivityCommentService(commentId: string): Promise<{ success: boolean; message: string }> {
  await mockRequest("activity.comment.delete");
  const viewer = await getMockViewer();
  const comment = findMockComment(commentId);
  if (!comment) return { success: false, message: "Comment not found." };
  if (!isAuthor(comment, viewer)) return { success: false, message: "You can only delete your own comments." };
  removeMockComment(commentId);
  const activity = findMockActivity(comment.targetId);
  if (activity) activity.commentCount = Math.max(0, activity.commentCount - 1);
  logMockWrite("deleteActivityComment", { commentId });
  return { success: true, message: "Comment deleted successfully" };
}

// ── Profile helper ───────────────────────────────────────────

export async function fetchMyAttendedEvents(): Promise<AttendedEventItem[]> {
  await mockRequest("activity.attendedEvents");
  const viewer = await getMockViewer();
  if (!viewer?.userId) throw new Error("Failed to fetch current user: not signed in (mock)");
  return eventIdsWithFlag("joined", viewer.userId)
    .map(findMockEvent)
    .filter((e) => e !== undefined)
    .map((e) => ({
      eventId: e.eventId,
      title: e.title,
      province: e.province,
      image: e.cover,
      startAt: e.startAt,
      endAt: e.endAt,
    }));
}

// ── Activity CRUD ────────────────────────────────────────────

export async function getActivityDetail(activityId: string): Promise<RawActivityItem | null> {
  await mockRequest("activity.detail");
  const activity = findMockActivity(activityId);
  if (!activity) return null;
  return toRawActivityItem(activity, actorOf(await getMockViewer()));
}

async function createMockActivity(data: CreateActivityRequest): Promise<string> {
  const { viewer } = await requireActor();
  const record: MockActivityRecord = {
    activityId: nextMockId("4"),
    content: data.content,
    province: data.province,
    userId: viewer.orgId ? null : viewer.userId,
    orgId: viewer.orgId,
    eventId: data.eventId || null,
    tags: data.tags.map((name) => ({ tagId: nextMockId("9"), name })),
    media: [],
    likeCount: 0,
    commentCount: 0,
    isPublished: data.isPublished,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };
  mockActivities.unshift(record);
  logMockWrite("createActivity (text only — media uploads are unavailable)", { activityId: record.activityId });
  return record.activityId;
}

async function updateMockActivity(activityId: string, data: Partial<CreateActivityRequest>): Promise<void> {
  const viewer = await getMockViewer();
  const activity = requireActivity(activityId);
  if (!isAuthor(activity, viewer)) throw new Error("You can only edit your own posts (mock)");
  if (data.content !== undefined) activity.content = data.content;
  if (data.province !== undefined) activity.province = data.province;
  if (data.isPublished !== undefined) activity.isPublished = data.isPublished;
  if (data.eventId !== undefined) activity.eventId = data.eventId || null;
  if (data.tags !== undefined) activity.tags = data.tags.map((name) => ({ tagId: nextMockId("9"), name }));
  activity.updatedAt = new Date().toISOString();
  logMockWrite("updateActivity", { activityId });
}

async function deleteMockActivity(activityId: string): Promise<void> {
  const viewer = await getMockViewer();
  const activity = requireActivity(activityId);
  if (!isAuthor(activity, viewer)) throw new Error("You can only delete your own posts (mock)");
  mockActivities.splice(mockActivities.indexOf(activity), 1);
  logMockWrite("deleteActivity", { activityId });
}

export async function createActivityServer(
  data: CreateActivityRequest,
): Promise<{ postId?: string; id?: string; activityId?: string }> {
  await mockRequest("activity.create");
  return { activityId: await createMockActivity(data) };
}

export async function updateActivityServer(activityId: string, data: Partial<CreateActivityRequest>): Promise<void> {
  await mockRequest("activity.update");
  await updateMockActivity(activityId, data);
}

export async function deleteActivityServer(activityId: string): Promise<void> {
  await mockRequest("activity.delete");
  await deleteMockActivity(activityId);
}

export async function createActivity(data: CreateActivityRequest): Promise<CreateActivityData> {
  await mockRequest("activity.create");
  return { activityId: await createMockActivity(data) };
}

export async function updateActivity(activityId: string, data: Partial<CreateActivityRequest>): Promise<void> {
  await mockRequest("activity.update");
  await updateMockActivity(activityId, data);
}

export async function deleteActivity(activityId: string): Promise<void> {
  await mockRequest("activity.delete");
  await deleteMockActivity(activityId);
}

export async function reportActivity(activityId: string, reason: string, details: string): Promise<void> {
  await mockRequest("activity.report");
  requireActivity(activityId);
  logMockWrite("reportActivity", { activityId, reason, details });
}

export async function removeMediaFromActivity(activityId: string, mediaId: string): Promise<void> {
  await mockRequest("activity.media.remove");
  const activity = requireActivity(activityId);
  const index = activity.media.findIndex((m) => m.actMediaId === mediaId);
  if (index === -1) throw new Error(`Failed to delete media ${mediaId}: not found (mock)`);
  activity.media.splice(index, 1);
  activity.media.forEach((m, i) => (m.sortOrder = i));
  logMockWrite("removeMediaFromActivity", { activityId, mediaId });
}

export async function uploadActivityImages(): Promise<void> {
  await mockRequest("activity.media.upload");
  throw new Error(`Image upload failed: ${UPLOAD_UNAVAILABLE}`);
}

export async function uploadActivityVideo(): Promise<void> {
  await mockRequest("activity.media.upload");
  throw new Error(`Video upload failed: ${UPLOAD_UNAVAILABLE}`);
}

// ── Feed & gallery ───────────────────────────────────────────

export async function fetchActivityFeed(
  cursor?: string,
  _accessToken?: string,
  currentUserId?: string,
  currentOrgId?: string | null,
): Promise<FeedPage> {
  try {
    await mockRequest("activity.feed");
  } catch {
    // The real service swallows HTTP errors into an empty page.
    return { activities: [], nextCursor: null, hasNext: false };
  }
  const actorId = currentOrgId ?? currentUserId ?? null;
  const page = cursorPage(publishedActivities(), cursor, FEED_PAGE_SIZE);
  return {
    activities: page.content.map((a) =>
      api.mapRawActivityToFeedActivity(toRawActivityItem(a, actorId), currentUserId, currentOrgId),
    ),
    nextCursor: page.nextCursor,
    hasNext: page.hasNext,
  };
}

async function galleryPage(cursor?: string | null): Promise<GalleryData> {
  await mockRequest("activity.gallery");
  const page = cursorPage(mockGalleryItems(), cursor, GALLERY_PAGE_SIZE);
  return {
    content: api.mapRawGalleryItems(page.content),
    nextCursor: page.nextCursor,
    hasNext: page.hasNext,
  };
}

export async function getGallery(cursor?: string | null): Promise<GalleryData> {
  return galleryPage(cursor);
}

export async function getGalleryPage(cursor?: string | null): Promise<GalleryData> {
  return galleryPage(cursor);
}

async function toggleFlag(activityId: string, flag: "liked" | "saved"): Promise<void> {
  const { actorId } = await requireActor();
  const activity = requireActivity(activityId);
  const nowOn = toggleActivityFlag(flag, actorId, activityId);
  if (flag === "liked") activity.likeCount = Math.max(0, activity.likeCount + (nowOn ? 1 : -1));
  logMockWrite(`toggle ${flag}`, { activityId, nowOn });
}

export async function toggleActivityReactionWithCookie(
  activityId: string,
  reaction: "like" | "saved",
): Promise<boolean> {
  await mockRequest("activity.reaction");
  try {
    await toggleFlag(activityId, reaction === "like" ? "liked" : "saved");
    return true;
  } catch {
    return false;
  }
}

export async function toggleLikeActivity(activityId: string): Promise<void> {
  await mockRequest("activity.like");
  await toggleFlag(activityId, "liked");
}

export async function toggleSavedActivity(activityId: string): Promise<void> {
  await mockRequest("activity.save");
  await toggleFlag(activityId, "saved");
}

// ── Pure mappers ─────────────────────────────────────────────

export const { mapRawActivityToFeedActivity, mapRawGalleryItems } = api;

/** Mock media are local /public paths, which must not be rewritten to backend URLs. */
function localMediaUrl(raw: string | null | undefined): string {
  return raw && raw.startsWith("/") ? raw : "";
}

export function mapActivityDetailToPostDetail(raw: RawActivityItem, fallbackId: string): MappedPostDetail {
  return api.mapActivityDetailToPostDetail(raw, fallbackId, localMediaUrl);
}
