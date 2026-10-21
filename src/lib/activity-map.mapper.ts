import {ActivityComment, ActivityCommentComponent, ApiActivityComment, ApiActivityReply,} from "@/types/activity.type";
import {CommentAuthor, CursorPage} from "@/types/event.type"; // adjust import path if CursorPage lives elsewhere
import {formatRelativeTime} from "./event-map.mapper"; // adjust path to wherever formatRelativeTime is exported

// ── Comment Author ───────────────────────────────────────────
// Same logic as mapCommentAuthor for events — org accounts take priority.
function mapActivityCommentAuthor(api: ApiActivityComment): CommentAuthor {
  const isOrganizer = api.orgId !== null;
  return {
    id: isOrganizer ? api.orgId! : (api.userId ?? ""),
    name: isOrganizer
      ? (api.orgName ?? api.fullName ?? "")
      : (api.fullName ?? ""),
    avatarUrl: isOrganizer ? (api.orgAvatar ?? null) : (api.avatar ?? null),
    isOrganizer,
  };
}

// ── Comment ──────────────────────────────────────────────────

/**
 * Maps a single ApiActivityComment → ActivityComment (= EventComment shape).
 * Used for BOTH top-level comments AND replies — same recursive shape.
 * Children start empty — fetched lazily via "View replies".
 */
export function mapApiActivityComment(
  api: ApiActivityComment,
): ActivityComment {
  return {
    id: api.commentId,
    content: api.content,
    isEdited: api.isEdited,
    postedAt: formatRelativeTime(api.createdAt),
    createdAt: api.createdAt,
    parentId: api.parentId,
    author: mapActivityCommentAuthor(api),
    userId: api.userId,
    fullName: api.fullName,
    avatar: api.avatar,
    orgId: api.orgId,
    orgName: api.orgName,
    orgAvatar: api.orgAvatar,
    hasReply: api.hasReply,
    replies: [],
    repliesLoaded: false,
    hasMoreReplies: false,
    repliesNextCursor: null,
  };
}

/**
 * Maps GET /api/v1/activities/{activityId}/comments → ActivityCommentComponent
 */
export function mapApiActivityCommentComponent(
  page: CursorPage<ApiActivityComment>,
): ActivityCommentComponent {
  return {
    comments: page.content.map(mapApiActivityComment),
    nextCursor: page.nextCursor,
    hasNext: page.hasNext,
  };
}

// ── Reply ────────────────────────────────────────────────────

/**
 * Maps a single ApiActivityReply → ActivityComment (same recursive shape).
 * A reply can itself have replies (hasReply, lazy-loaded via the same endpoint).
 */
export function mapApiActivityReply(api: ApiActivityReply): ActivityComment {
  return mapApiActivityComment(api);
}

/**
 * Maps GET /api/v1/activities/comments/{commentId}/replies → replies + pagination
 * Works for ANY node id — a top-level comment or a nested reply.
 */
export function mapApiActivityReplyComponent(
  page: CursorPage<ApiActivityReply>,
): {
  replies: ActivityComment[];
  nextCursor: string | null;
  hasNext: boolean;
} {
  return {
    replies: page.content.map(mapApiActivityReply),
    nextCursor: page.nextCursor,
    hasNext: page.hasNext,
  };
}
