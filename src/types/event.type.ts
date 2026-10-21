import { AppBaseCategoryType, AppStatus } from "./common.type";
import { EventAppStatus } from "@/components/profile/FilterEventComponent";

// ============================================================
// SHARED PAGINATION WRAPPERS
// ============================================================

/** Cursor-based pagination (comments, replies) */
export interface CursorPage<T> {
  content: T[];
  nextCursor: string | null;
  hasNext: boolean;
}

/** Offset-based pagination (ratings) */
export interface OffsetPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/** Standard API envelope */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// ============================================================
// YOUR EXISTING — GET /events/map (untouched)
// ============================================================

export interface MapEventLocation {
  province: string | null;
  district: string | null;
  commune: string | null;
  specificAddr: string | null;
}

// Raw shape from backend
export interface ApiMapEvent {
  eventId: string;
  title: string;
  description: string;
  categoryName: string;
  image: string | null;
  latitude: number;
  longitude: number;
  price: number;
  rating: number;
  isLiked: boolean;
  isSaved: boolean;
  startAt: string;
  endAt: string;
  isJoined: boolean;
  location: MapEventLocation;
  province: string;
}

// Mapped shape for frontend use
export interface MapEvent {
  id: string;
  title: string;
  description: string;
  category: AppBaseCategoryType;
  imageUrl: string | null;
  lat: number;
  lng: number;
  price: number;
  isFree: boolean;
  rating: number;
  isLiked: boolean;
  isSaved: boolean;
  startDate: string; // "Jan 8, 2026"
  endDate: string;
  isJoined: boolean;
  location: MapEventLocation;
}

// ============================================================
// NEW — GET /api/v1/events/{eventId} raw backend type
// ============================================================

/** One agenda slot returned by the backend */
export interface ApiAgendaItem {
  order: number;
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  speakerName: string;
  description: string;
}

/**
 * Agenda from backend: date string as key → array of items
 * e.g. { "2026-07-10": [ { order: 1, ... }, ... ] }
 */
export type ApiAgenda = Record<string, ApiAgendaItem[]>;

/** Star breakdown summary returned inside event detail */
export interface ApiRatingSummary {
  average: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
  total: number;
}

export interface ApiEventDetail {
  eventId: string;
  title: string;
  description: string;
  province: string;
  address: {
    district: string | null;
    commune: string | null;
    specificAddr: string | null;
  } | null;
  cover: string | null;
  agenda: ApiAgenda;
  latitude: number;
  longitude: number;
  status: "Published" | "Draft" | "Cancelled" | "Completed";
  price: number;
  capacity: number | null;
  startAt: string; // ISO 8601
  endAt: string; // ISO 8601
  orgId: string | null;
  userId: string | null;
  categoryId: string;
  likeCount: number;
  commentCount: number;
  ratingCount: number;
  reportCount: number;
  isSaved: boolean;
  isLiked: boolean;
  isJoined: boolean;
  joined?: number;
  // Inline rating items (subset) — full list via /ratings endpoint
  ratings: ApiRating[];
  // Star breakdown summary
  ratingSummary: ApiRatingSummary | null;
}

// ── GET /api/v1/events/{eventId}/comment ─────────────────────

export interface ApiComment {
  commentId: string;
  content: string;
  isEdited: boolean;
  /** null = top-level comment */
  parentId: string | null;
  createdAt: string; // ISO 8601
  // Author — either a regular user OR an org account
  userId: string | null;
  fullName: string | null;
  avatar: string | null;
  orgId: string | null;
  orgName: string | null;
  orgAvatar: string | null;
  // Whether this comment has at least one reply
  hasReply: boolean;
}

// ── GET /api/v1/events/comment/{commentId}/replies ───────────

/** Same shape as ApiComment — replies are just comments with a parentId set */
export type ApiReply = ApiComment;

// ── GET /api/v1/events/{eventId}/ratings ─────────────────────

export interface ApiRating {
  ratingId: string;
  score: 1 | 2 | 3 | 4 | 5;
  review: string;
  createdAt: string; // ISO 8601
  userId: string;
  fullName: string;
  avatar: string | null;
  /** Total rating count echoed per item — use OffsetPage.totalElements instead */
  totalCount: number;
}

// ============================================================
// NEW — Frontend types for event detail page
// ============================================================

/** One agenda slot for frontend use */
export interface AgendaItem {
  order: number;
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  speakerName: string;
  description: string;
}

/**
 * Agenda for frontend: date string as key → array of items
 * e.g. { "2026-07-10": [ { order: 1, ... }, ... ] }
 */
export type Agenda = Record<string, AgendaItem[]>;

/** Star breakdown for display in rating bar charts */
export interface RatingSummary {
  average: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
  total: number;
}

export interface EventDetailLocation {
  province: string;
  district: string | null;
  commune: string | null;
  specificAddr: string | null;
  lat: number;
  lng: number;
}

export interface EventDetail {
  id: string;
  title: string;
  description: string;
  category: AppBaseCategoryType;
  imageUrl: string | null;
  location: EventDetailLocation;
  /** "Apr 1, 2025" */
  startDate: string;
  /** "Apr 1, 2025" */
  endDate: string;
  /** "08:00 AM" */
  startTime: string;
  /** "05:00 PM" */
  endTime: string;
  status: "Published" | "Draft" | "Cancelled" | "Completed";
  price: number;
  isFree: boolean;
  capacity: number | "unlimited";
  totalLikes: number;
  totalComments: number;
  totalRatings: number;
  totalReports: number;
  // null when event has no ratings yet
  ratingSummary: RatingSummary | null;
  isLiked: boolean;
  isSaved: boolean;
  isJoined: boolean;
  joined: number;
  organizerId: string | null;
  creatorId: string | null;
  categoryId: string;
  // Inline rating items returned directly inside event detail
  inlineRatings: EventRatingItem[];
  agenda: Agenda;
}

/** Unified author shape — handles both user and org posters */
export interface CommentAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
  /** true when the comment was posted by an org account */
  isOrganizer: boolean;
}

export interface EventComment {
  id: string;
  content: string;
  isEdited: boolean;
  /** Relative or formatted time string, e.g. "2 hours ago" */
  postedAt: string;
  /** Raw ISO from backend */
  createdAt: string;
  /** Immediate parent — null for top-level comment, a comment/reply id otherwise */
  parentId: string | null;
  author: CommentAuthor;
  /** Raw user fields from backend */
  userId: string | null;
  fullName: string | null;
  avatar: string | null;
  /** Raw org fields from backend */
  orgId: string | null;
  orgName: string | null;
  orgAvatar: string | null;
  /** Whether this node has at least one reply — from backend */
  hasReply: boolean;
  /** Lazy-loaded children — start empty until "View replies" is clicked */
  replies: EventComment[];
  /** Tracks whether replies have been fetched at least once */
  repliesLoaded: boolean;
  hasMoreReplies: boolean;
  repliesNextCursor: string | null;
}

/** @deprecated use EventComment for both top-level comments and replies — kept as alias */
export type EventReply = EventComment;

export interface EventCommentComponent {
  comments: EventComment[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface EventRatingItem {
  id: string;
  score: 1 | 2 | 3 | 4 | 5;
  review: string;
  reviewedAt: string; // "Apr 2, 2025"
  /** Raw ISO from backend */
  createdAt: string;
  /** Echoed total count from backend */
  totalCount: number;
  /** Raw user fields from backend */
  userId: string;
  fullName: string;
  avatar: string | null;
  reviewer: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface EventRatingComponent {
  ratings: EventRatingItem[];
  page: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

// ============================================================
// ORG PROFILE — GET /api/v1/organizations/{orgId}
// ============================================================

export interface ApiBadge {
  type: string;
  quantity: number;
  awardedMonths: string[];
}

export interface ApiOrgProfile {
  orgId: string;
  name: string;
  logo: string | null;
  about: string | null;
  phone: string | null;
  website: string | null;
  province: string | null;
  badge: ApiBadge[];
  eventCount: number;
  activityCount: number;
  favoriteCount: number;
  isFavorite: boolean;
}

export interface OrgProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  about: string | null;
  phone: string | null;
  website: string | null;
  province: string | null;
  badges: ApiBadge[];
  eventCount: number;
  activityCount: number;
  favoriteCount: number;
  isFavorite: boolean;
}

// ============================================================
// USER PROFILE — GET /api/v1/users/{userId}/profile
// ============================================================

export interface ApiUserProfile {
  userId: string;
  fullName: string;
  avatar: string | null;
  badge: ApiBadge[];
  favoriteCount: number;
  activityCount: number;
  createdEventCount: number;
  orgId: string | null;
  orgName: string | null;
  orgLogo: string | null;
  isFavorite: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  badges: ApiBadge[];
  favoriteCount: number;
  activityCount: number;
  createdEventCount: number;
  orgId: string | null;
  orgName: string | null;
  orgLogo: string | null;
  isFavorite: boolean;
}

// ============================================================
// JOIN EVENT — POST /api/v1/events/{eventId}/join
// ============================================================

export interface ApiJoinEvent {
  requiresPayment: boolean;
  attendeeId: string;
  ticketQr: string | null; // base64 image
  bakongQrString: string | null;
  bakongQrImage: string | null;
  md5: string | null;
  currency: string | null;
}

export interface JoinEventResult {
  requiresPayment: boolean;
  attendeeId: string | null;
  ticketQr: string | null;
  bakongQrString: string | null;
  bakongQrImage: string | null;
  md5: string | null;
  currency: string | null;
}

export interface EventLocation {
  province: string;
  district?: string | null;
  commune?: string | null;
}

export interface EventlistResponse {
  id: string;
  tittle: string;
  location: EventLocation;
  price?: number | null;
  description?: string | null;
  image: string;
  startdate: string;
  stopdate: string;
  category: AppBaseCategoryType;
  rating?: number | null;
  isLiked: boolean;
  isSave: boolean;
  status: AppStatus;
}

export interface WalletEventList {
  eventId: string;
  title: string;
  cover: string;
  price: number;
  startAt: string;
  endAt: string;
  province: string;
}

//UpcomingEventRequest
export interface UpcomingEventRequest {
  actorId: string;
  isOrg: boolean;
  search: string;
  boundaryWkt: string;
  cursor: string;
  size: number;
  startFrom: string;
  endAt: string;
  categoryIds: string[];
}

//UpcomingEventResponse
export interface UpcomingEventResponse {
  categoryName: string;
  description: string;
  endAt: string;
  eventId: string;
  image: string;
  isLiked: boolean;
  isSaved: boolean;
  latitude: number;
  location: {
    province: string;
    district: string;
    commune: string;
  };
  longitude: number;
  price: number;
  province: string;
  rating: number;
  startAt: string;
  title: string;
}

// EventDetailResponse
export interface EventDetailResponse {
  eventId: string;
  eventTittle: string;
  startdate: string;
  stopdate: string;
  location: {
    province: string;
    district?: string | null;
    commune?: string | null;
    street?: string | null;
  };
  eventPrice?: number | null;
  eventDescription: string;
  eventImage: string;
  category: AppBaseCategoryType;
  rate: {
    rating: number;
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
    totalRater: number;
  };

  totalLikes: number;
  isLiked: boolean;
  isSave: boolean;
  capacity: number;
  isRegistered: boolean;

  eventUser: {
    posterId: string;
    fullName: string;
    posterImage: string;
    isOrganizer: boolean;
    isFavorite: boolean;
    datePosted: string;
  };

  currentUser: "100";
  currentUserName?: "Pes Sokry";
  currentUserImage?: "https://i.pinimg.com/736x/97/93/99/979399930c4332aa4d8e36068672dce8.jpg";

  locationImage?: string;

  totalComments: number;
  comments?: {
    commenterId: string;
    commenterName: string;
    commenterImage: string;
    commentContent: string;
    time: string;
    replyComments?: {
      replyerId: string;
      replyerName: string;
      replyerImage: string;
      replyContent: string;
      time: string;
    }[];
  }[];

  agenda: {
    date: string;
    time: string;
    activity: string;
    speaker: string;
    timeDuration: string;
  }[];

  reviews?:
    | {
        reviewerId: string;
        reviewerName: string;
        reviewerImage: string;
        rating: number;
        reviewContent: string;
        reviewDate: string;
      }[]
    | null;
}

export interface AttendedEvent {
  eventId: string;
  title: string;
  province: string;
  price?: number | null;
  description: string;
  image: string;
  startAt: string;
  endAt: string;
  categoryName: AppBaseCategoryType;
  rating: number;
  isLiked: boolean;
  isSaved: boolean;
}

export interface CreatedEvent {
  eventId: string;
  title: string;
  province: string;
  price?: number | null;
  description: string;
  image: string;
  startAt: string;
  endAt: string;
  categoryName: AppBaseCategoryType;
  rating: number;
  isLiked: boolean;
  isSaved: boolean;
  status: EventAppStatus;
}

export interface SavedEvent {
  eventId: string;
  title: string;
  province: string;
  location: string;
  price?: number | null;
  description: string;
  image: string;
  startAt: string;
  endAt: string;
  categoryName: AppBaseCategoryType;
  rating: number;
  isLiked: boolean;
  isSaved: boolean;
}

type CardVariant = "profile" | "saved" | "attended" | "default";
export interface EventProfileRespone {
  eventId: string;
  title: string;
  province: string;
  price?: number | null;
  description: string;
  image: string;
  startAt: string;
  endAt: string;
  categoryName: AppBaseCategoryType;
  rating: number;
  isLiked: boolean;
  isSaved: boolean;
  status?: EventAppStatus | null;
  variant?: CardVariant;
  onDelete?: () => void;
  onUnsave?: (eventId: string) => void;
}
