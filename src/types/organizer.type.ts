import {AgendaDay} from "@/types/common.type";

export interface OrganizerKpi {
    totalEvents: number;
    totalFavorites: number;
    totalMoneyEarned: number;
    totalRatings: number;
}

export interface RecentTransaction {
    id: string;
    type: "Earn" | "Withdraw" | string;
    status: "Pending" | "Approved" | "Rejected" | null;
    note: string;
    amount: number;
    balanceAfter: number | null;
    proofUrl: string | null;
    createdAt: string;
}

export interface TransactionResponse {
    success: boolean;
    message: string | null;
    data: {
        content: RecentTransaction[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
    timestamp: string;
}

export interface TotalEarningsPerMonth {
    month: string;
    totalEarning: number;
}

export interface currentBalance {
    balance: number;
    currency: string;
    walletId: string;
}

export interface organizationInfo{
    name: string,
    logo: string,
    about: string,
    phone: string,
    website: string,
    province: string,
}

export interface UpdateOrganizationRequest {
    name: string;
    about: string;
    phone: string;
    website: string;
}

export interface EventManagement {
    categoryName: string,
    description: string,
    endAt: string,
    eventId: string,
    image: string,
    isLiked: boolean,
    "isSaved": boolean,
    latitude: string,
    location: string,
    longitude: string,
    price: number,
    province: string,
    rating: number,
    startAt: string,
    title: string
}

// Cursor-paginated page of organizer events (mirrors the main events endpoint)
export interface EventManagementPage {
    events: EventManagement[];
    nextCursor: string | null;
    hasNext: boolean;
}


export interface EventAddress {
    district: string;
    commune: string;
    specificAddr: string;
}

export interface EventAgendaItem {
    order: number;
    startTime: string;
    endTime: string;
    speakerName: string;
    description: string;
}

export interface EventAgenda {
    additionalProperty: EventAgendaItem[];
}

export type EventStatus = "Pending" | "Approved" | "Rejected" | string;

export interface EventManagementDetails {
    eventId: string;
    title: string;
    address: EventAddress;
    description: string;
    cover: string;
    agenda: EventAgenda;
    latitude: number;
    longitude: number;
    province: string;
    status: EventStatus;
    price: number;
    capacity: number;
    startAt: string;
    endAt: string;
    rejectedReason: string;
    reviewedAt: string;
    orgId: string;
    userId: string;
    categoryId: string | { id: string; name: string };
    categoryName: string;
    likeCount: number;
    commentCount: number;
    ratingCount: number;
    reportCount: number;
}

//  Rating
export interface RatingItem {
    ratingId: string;
    score: number;
    review: string;
    createdAt: string;
    userId: string;
    fullName: string;
    avatar: string;
    totalCount: number;
}

export interface RatingsResponse {
    content: RatingItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

//   Comment
export interface CommentItem {
    commentId: string;
    content: string;
    isEdited: boolean;
    parentId: string | null;
    createdAt: string;
    userId: string;
    fullName: string;
    avatar: string;
    orgId: string | null;
    orgName: string | null;
    orgAvatar: string | null;
}

export interface CommentsResponse {
    content: CommentItem[];
    nextCursor: string | null;
    hasNext: boolean;
}

//  Badge
export interface OrgBadge {
    type: string;
    quantity: number;
    awardedMonths: string[];
}

// Rating Summary
export interface RatingSummary {
    average: number;
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
    total: number;
}

export interface OrganizationInfo {
    orgId: string;
    name: string;
    logo: string;
    about: string;
    phone: string;
    website: string;
    province: string;
    isFavorite: boolean;
    badge: OrgBadge[];
    eventCount: number;
    activityCount: number;
    favoriteCount: number;
}

export interface EventManagementDetail {
    eventId: string;
    title: string;
    address: string;
    description: string;
    cover: string;
    agenda: Record<string, {
        order: number;
        startTime: string;
        endTime: string;
        speakerName: string;
        description: string;
    }[]>;
    latitude: number;
    longitude: number;
    province: string;
    status: string;
    price: number;
    capacity: number;
    startAt: string;
    endAt: string;
    orgId: string;
    userId: string | null;
    categoryId: string;
    likeCount: number;
    commentCount: number;
    ratingCount: number;
    reportCount: number;
    isSaved: boolean;
    isLiked: boolean;
    isJoined: boolean;
    ratings: any[];
    ratingSummary: RatingSummary;
}

export interface TotalLikeAndAttendee{
    month: string,
    totalLikes: number,
    totalAttendees: number,
}

export interface ApiResponse<T> {
    success: boolean;
    message: string | null;
    data: T;
    timestamp: string;
}

export interface StatMetric {
    title: string;
    value: string | number;
    iconBg: string;
    dotColor: string;
    iconName: "Calendar" | "Star" | "Heart" | "Money";
}

export const eventTypes = ["Indoor", "Outdoor"];

export interface OrganizerEventAgendaItem {
    time: string;
    title: string;
    speaker: string;
    duration: string;
}

export interface OrganizerEventMetric {
    label: string;
    value: string;
    note: string;
}

export interface OrganizerEventCommentReply {
    id: string;
    name: string;
    avatar: string;
    content: string;
    time: string;
}

export interface OrganizerEventComment {
    id: string;
    name: string;
    avatar: string;
    content: string;
    time: string;
    replies: OrganizerEventCommentReply[];
}

export interface OrganizerEventReview {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    date: string;
    content: string;
}

export interface OrganizerEventScore {
    rating: number;
    reviewCount: number;
    breakdown: { stars: number; value: number }[];
}

export interface OrganizerEventVenue {
    name: string;
    address: string;
    mapImage: string;
    lat: number;
    lng: number;
}

export interface EventSubmission {
    id: number | string;
    title: string;
    location: string;
    price: string;
    rating: number;
    date: string;
    category: string;
    description: string;
    image: string;
    status?: "in_progress" | "upcoming" | "draft";
    agenda?: AgendaDay[];
}

export interface OrganizerEventDetail {
    id: number | string;
    title: string;
    location: string;
    price: string;
    rating: number;
    date: string;
    category: string;
    status: NonNullable<EventSubmission["status"]>;
    description: string;
    image: string;
    organizer: {
        name: string;
        role: string;
        email: string;
        phone: string;
        avatar: string;
    };
    venue: OrganizerEventVenue;
    metrics: OrganizerEventMetric[];
    score: OrganizerEventScore;
    agenda: OrganizerEventAgendaItem[];
    comments: OrganizerEventComment[];
    reviews: OrganizerEventReview[];
    highlights: string[];
}

export interface OrgChangeAvatarType {
    avatar: string;
}