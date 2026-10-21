import {ApiRes, MediaType} from "./common.type";
import {EventComment, EventCommentComponent} from "./event.type";

// ============================================================
// ACTIVITY COMMENTS
// Same shape as event comments — backend returns identical structure
// for GET /activities/{activityId}/comments and
// GET /activities/comments/{commentId}/replies
// ============================================================

/**
 * Raw shape from:
 *  - GET /api/v1/activities/{activityId}/comments
 *  - GET /api/v1/activities/comments/{commentId}/replies
 * Identical to ApiComment for events.
 */
export interface ApiActivityComment {
  commentId: string;
  content: string;
  isEdited: boolean;
  /** null = top-level comment */
  parentId: string | null;
  createdAt: string; // ISO 8601
  userId: string | null;
  fullName: string | null;
  avatar: string | null;
  orgId: string | null;
  orgName: string | null;
  orgAvatar: string | null;
  hasReply: boolean;
}

/** Same shape as ApiActivityComment — replies are just comments with a parentId set */
export type ApiActivityReply = ApiActivityComment;

/**
 * Mapped activity comment tree — reuses EventComment's recursive shape
 * (id, content, replies, hasReply, repliesLoaded, hasMoreReplies, repliesNextCursor, etc.)
 */
export type ActivityComment = EventComment;

/**
 * Maps GET /api/v1/activities/{activityId}/comments → ActivityCommentComponent
 */
export type ActivityCommentComponent = EventCommentComponent;

export interface AttendedEventItem {
  eventId: string;
  title: string;
  province: string;
  image: string | null;
  startAt: string;
  endAt?: string;
}

export interface AttendedEventsPage {
  content: AttendedEventItem[];
}

export type AttendedEventsResponse = ApiRes<AttendedEventsPage>;

export interface CreateActivityRequest {
  content: string;
  isPublished: boolean;
  province: string;
  eventId: string;
  tags: string[];
}

export interface CreateActivityData {
  activityId: string;
}

export type CreateActivityResponse = ApiRes<CreateActivityData>;

export interface MediaValidationError {
  file: File;
  reason: string;
}

export type MediaMode = "images" | "video" | null;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_IMAGE_COUNT = 10;

export interface PostDetail {
    postId: string;
    postType: string;
    duration?: string | null;
    thumbnail?: string | null;
    postContent: string[];
    postLocation?: string;
    postDescription: string;
    totalLikes: number;
    isLiked: boolean;
    isSaved: boolean;
    currentUser?: {
        userId: string;
        username: string;
        profileImage: string;
    };
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
    postUser: {
        posterId: string;
        fullName: string;
        posterImage: string;
        isOrganizer: boolean;
        isFavorite: boolean;
        datePosted: string;
        tags: string[];
    };
    likedEvent: {
        eventId: string;
        eventImage: string;
        eventTittle: string;
        startDate: string;
        stopDate: string;
        location: string;
    } | null;
} //Gallery
export interface Activities {
    activitiesId: string;
    user: User;
    location?: string | null;
    type: MediaType;
    content: string | null;
    tags: string[];
    media: Media[];
    linkedEvent: {
        eventId: string;
        eventTitle: string;
    };
    likes: number;
    commentsCount: number;
    shares: number;
    isOwner: boolean;
    isLiked: boolean;
    isSaved: boolean;
    createdAt: string;
}

export interface User {
    userId: string;
    username: string;
    profileImage: string;
    isOrg?: boolean;
}

export interface Media {
    actMediaId?: string;
    url: string;
    type: "image" | "video";
    duration?: string | null;
}

export interface GalleryResponse {
    id: string;
    src: string;
    duration?: string | null;
    type: "IMAGE" | "VIDEO";
    hasMore: boolean;
    alt?: string;
    createdAt: string;
}

export interface EventLink {
    eventId: string;
    eventTitle: string;
}

export interface Activity {
    activitiesId: string;
    user: User;
    type: "image" | "video";
    content: string | null;
    tags: string[];
    media: Media[];
    location?: string | null;
    linkedEvent?: EventLink;
    likes: number;
    commentsCount: number;
    shares: number;
    isOwner: boolean;
    isLiked: boolean;
    isSaved: boolean;
    createdAt: string;
}

export interface RawActivityItem {
    activityId: string;
    commentCount: number;
    content: string;
    createdAt: string;
    updatedAt: string | null;
    event: {
        eventId: string;
        eventName: string;
        cover: string | null;
        startAt: string | null;
        endAt: string | null;
        address: string | {
            specificAddr?: string | null;
            commune?: string | null;
            district?: string | null;
        } | null;
    } | null;
    isLiked: boolean;
    isSaved: boolean;
    likeCount: number;
    media: {
        actMediaId: string;
        sortOrder: number;
        fileUrl: string;
        type: "Video" | "Image";
        durationSeconds: number | null;
    }[];
    orgId: string | null;
    ownerAvatar: string | null;
    ownerName: string | null;
    province: string;
    tags: { tagId: string; name: string }[];
    userId: string | null;
}

export interface ActivitiesDetailResponse {
    activityId: string | null;
    commentCount: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    province: string;
    isLiked: boolean;
    isSaved: boolean;
    likeCount: number;
    event: {
        eventId: string;
        eventName: string;
        cover: string;
        startAt: string;
        endAt: string;
        address: string;
    } | null;
    media: {
        actMediaId: string;
        sortOrder: number;
        fileUrl: string;
        type: "Video" | "Image";
        durationSeconds: number;
    }[];
    orgId: string;
    ownerAvatar: string;
    ownerName: string;
    userId: string | null;
    tags: string[];
}

export interface ActivityDetail {
    activityId: string | null;
    commentCount: number;
    content: string;
    createdAt: string;
    eventId: string;
    eventName: string;
    isLiked: boolean;
    isSaved: boolean;
    likeCount: number;
    media: Media[];
    orgId: string;
    ownerAvatar: string;
    ownerName: string;
    province: string;
    tags: string[];
    updatedAt: string;
    userId: string | null;
}

export type CursorData<T> = {
  content: T[];
  nextCursor: string | null;
  hasNext: boolean;
};
export interface ActivitiesResponse {
  activityId: string;
  previewUrl: string;
  mediaType: MediaType;
  durations?: string | null;
  hasMore: boolean;
  createdAt: string;
}

export interface RawGalleryItem {
    activityId: string;
    mediaId: string;
    previewUrl: string;
    mediaType: "Video" | "Image";
    hasMore: boolean;
    createdAt: string;
    durations?: number | null;
}

export interface GalleryApiResponse {
    success: boolean;
    message: string;
    data: {
        content: RawGalleryItem[];
        nextCursor: string;
        hasNext: boolean;
    };
    timestamp: string;
}

export interface GalleryData {
    content: GalleryResponse[];
    nextCursor: string | null;
    hasNext: boolean;
}