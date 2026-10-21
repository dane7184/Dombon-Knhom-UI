import { AppBaseCategoryType } from "@/types/common.type";
import {
  ApiMapEvent,
  MapEvent,
  ApiEventDetail,
  ApiComment,
  ApiReply,
  ApiRating,
  CursorPage,
  OffsetPage,
  EventDetail,
  EventComment,
  EventCommentComponent,
  EventReply,
  EventRatingItem,
  EventRatingComponent,
  CommentAuthor,
  Agenda,
  RatingSummary,
} from "@/types/event.type";
import { Province } from "../constant/province";

// ── Helpers ──────────────────────────────────────────────────

// const FALLBACK_IMAGE = "/images/fallback-event-image.png";
// const FALLBACK_PROFILE = "/images/fallback-pf.png";
// const MEDIA_ENDPOINT = "https://api.dombonkhnom.com/api/v1/media/images/";

// export function buildImageUrl(path: string | null | undefined): string {
//   if (!path) return FALLBACK_IMAGE;
//   if (path.startsWith("http")) return path;
//   const fileName = path.startsWith("/") ? path.slice(1) : path;
//   return `${MEDIA_ENDPOINT}${fileName}`;
// }

// export function buildImageProfile(path: string | null | undefined): string {
//   if (!path) return FALLBACK_PROFILE;
//   if (path.startsWith("http")) return path;
//   const fileName = path.startsWith("/") ? path.slice(1) : path;
//   return `${MEDIA_ENDPOINT}${fileName}`;
// }

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatProvince(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw.replace(/_/g, " ");
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(iso);
}

// ============================================================
// YOUR EXISTING MAPPERS (untouched)
// ============================================================

export function mapApiEvent(api: ApiMapEvent): MapEvent {
  return {
    id: api.eventId,
    title: api.title,
    description: api.description,
    // category: toCategory(api.categoryName),
    category: api.categoryName as AppBaseCategoryType,
    // category: resolveCategoryKey(api.categoryName),
    // imageUrl: api.image ?? FALLBACK_IMAGE,
    imageUrl: api.image ?? null,
    // imageUrl: api.image ? `${API_URL}${api.image}` : FALLBACK_IMAGE,
    lat: api.latitude,
    lng: api.longitude,
    price: api.price,
    isFree: api.price === 0,
    rating: api.rating,
    isLiked: api.isLiked,
    isSaved: api.isSaved,
    startDate: formatDate(api.startAt),
    endDate: formatDate(api.endAt),
    isJoined: api.isJoined,
    location: {
      province: formatProvince(api.province) ?? "",
      district: api.location?.district ?? "",
      commune: api.location?.commune ?? "",
      specificAddr: api.location?.specificAddr ?? "",
    },
  };
}

export function mapApiEvents(apis: ApiMapEvent[]): MapEvent[] {
  return apis.map(mapApiEvent);
}

// ============================================================
// NEW MAPPERS — Event Detail
// ============================================================

/**
 * Maps GET /api/v1/events/{eventId} → EventDetail
 */
export function mapApiEventDetail(api: ApiEventDetail): EventDetail {
  // Map ratingSummary — null if backend returns null (no ratings yet)
  const ratingSummary: RatingSummary | null = api.ratingSummary
    ? {
        average: api.ratingSummary.average,
        fiveStar: api.ratingSummary.fiveStar,
        fourStar: api.ratingSummary.fourStar,
        threeStar: api.ratingSummary.threeStar,
        twoStar: api.ratingSummary.twoStar,
        oneStar: api.ratingSummary.oneStar,
        total: api.ratingSummary.total,
      }
    : null;

  return {
    id: api.eventId,
    title: api.title,
    description: api.description,
    category: api.categoryId as AppBaseCategoryType, // swap for categoryName once backend exposes it
    imageUrl: api.cover ?? null,
    location: {
      province: formatProvince(api.province) ?? "",
      district: api.address?.district ?? null,
      commune: api.address?.commune ?? null,
      specificAddr: api.address?.specificAddr ?? null,
      lat: api.latitude,
      lng: api.longitude,
    },
    startDate: formatDate(api.startAt),
    endDate: formatDate(api.endAt),
    startTime: formatTime(api.startAt),
    endTime: formatTime(api.endAt),
    status: api.status,
    price: api.price,
    isFree: api.price === 0,
    capacity: !api.capacity ? "unlimited" : api.capacity,
    totalLikes: api.likeCount,
    totalComments: api.commentCount,
    totalRatings: api.ratingCount,
    totalReports: api.reportCount,
    ratingSummary,
    isLiked: api.isLiked,
    isSaved: api.isSaved,
    isJoined: api.isJoined,
    joined: api.joined ?? 0,
    organizerId: api.orgId,
    creatorId: api.userId ?? null,
    categoryId: api.categoryId,
    // Inline ratings from detail endpoint — use /ratings endpoint for full paginated list
    inlineRatings: api.ratings.map(mapApiRating),
    agenda: api.agenda,
  };
}

// ── Comment Author ───────────────────────────────────────────

function mapCommentAuthor(api: ApiComment): CommentAuthor {
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
 * Maps a single ApiComment → EventComment.
 * Used for BOTH top-level comments AND replies — same recursive shape.
 * Replies/children start empty — fetched lazily via "View replies".
 */
export function mapApiComment(api: ApiComment): EventComment {
  return {
    id: api.commentId,
    content: api.content,
    isEdited: api.isEdited,
    postedAt: formatRelativeTime(api.createdAt),
    createdAt: api.createdAt,
    parentId: api.parentId,
    author: mapCommentAuthor(api),
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
 * Maps GET /api/v1/events/{eventId}/comment → EventCommentComponent
 */
export function mapApiCommentComponent(
  page: CursorPage<ApiComment>,
): EventCommentComponent {
  return {
    comments: page.content.map(mapApiComment),
    nextCursor: page.nextCursor,
    hasNext: page.hasNext,
  };
}

// ── Reply ────────────────────────────────────────────────────

/**
 * Maps a single ApiReply → EventComment (same recursive shape as top-level comments).
 * A reply can itself have replies (hasReply, lazy-loaded via the same endpoint).
 */
export function mapApiReply(api: ApiReply): EventComment {
  return mapApiComment(api);
}

/**
 * Maps GET /api/v1/events/comment/{commentId}/replies → replies + pagination
 * Works for ANY node id — a top-level comment or a nested reply.
 */
export function mapApiReplyComponent(page: CursorPage<ApiReply>): {
  replies: EventComment[];
  nextCursor: string | null;
  hasNext: boolean;
} {
  return {
    replies: page.content.map(mapApiReply),
    nextCursor: page.nextCursor,
    hasNext: page.hasNext,
  };
}

// ── Rating ───────────────────────────────────────────────────

/**
 * Maps a single ApiRating → EventRatingItem
 */
export function mapApiRating(api: ApiRating): EventRatingItem {
  return {
    id: api.ratingId,
    score: api.score,
    review: api.review,
    reviewedAt: formatDate(api.createdAt),
    createdAt: api.createdAt,
    totalCount: api.totalCount,
    userId: api.userId,
    fullName: api.fullName,
    avatar: api.avatar,
    reviewer: {
      id: api.userId,
      name: api.fullName,
      avatarUrl: api.avatar ?? null,
    },
  };
}

/**
 * Maps GET /api/v1/events/{eventId}/ratings → EventRatingPage
 */
export function mapApiRatingComponent(
  page: OffsetPage<ApiRating>,
): EventRatingComponent {
  return {
    ratings: page.content.map(mapApiRating),
    page: page.page,
    totalElements: page.totalElements,
    totalPages: page.totalPages,
    isFirst: page.first,
    isLast: page.last,
  };
}
