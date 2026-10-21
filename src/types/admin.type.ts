import {ApiRes, CursorData, MediaType, PaginatedData, Role} from "@/types/common.type";
import {EventReportTabDetail, Report} from "@/types/eventReport.type";

export interface RecentUser {
    userId: number;
    fullName: string;
    gender: string;
    email: string;
    role: Role;
    totalCount: number;
}

export interface FetchRecentUserParam {
    page?: number;
    size?: number;
}

export interface Category {
    categoryId: string;
    name: string;
    totalCount: number;
}

export interface CreateCategoryResponse {
    categoryId: string;
}

export interface UpdateCategoryResponse {
    success: boolean;
    message: string;
    data?: {
        categoryId: string;
        name: string;
    };
}

export interface DeleteCategoryResponse {
    success: boolean;
    message: string;
}

export type PaginatedAdminOverview = CursorData<RecentUser>

export type AdminOverviewResponse = ApiRes<PaginatedAdminOverview>

export interface StatMetric {
    title: string;
    value: string | number;
    iconBg: string;
    dotColor: string;
    iconName: "Calendar" | "Star" | "Heart" | "Money";
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSACTIONS
// ─────────────────────────────────────────────────────────────────────────────
export interface TransactionResponse {
    paymentId: string;
    fullName: string;
    amount: number;
    organizer: string;
    event: string;
    date: string;
    totalCount: number;
}

export interface FetchTransactionsParams {
    search?: string;
    sort?: string;
    page?: number;
    size?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// WITHDRAWALS
// ─────────────────────────────────────────────────────────────────────────────
export interface FetchWithdrawalsParams {
    status?: "Pending" | "Approved" | "Rejected";
    sort?: "Newest" | "Oldest";
    page?: number;
    size?: number;
}

export interface WithdrawalResponse {
    withdrawalId: string;
    orgName: string;
    amount: number;
    requestDate: string;
    status: "Pending" | "Approved" | "Rejected";
    qrString: string;
    transactionRef?: string | null;
    proofUrl?: string | null;
    totalCount: number;
}

export interface WithdrawalKpi {
    totalRequests: number;
    approved: number;
    pending: number;
    rejected: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────────────────────────────────────
export interface FetchReportsParams {
    type?: "Activity" | "Event";
    status?: "Pending" | "Approved" | "Rejected";
    sort?: "Newest" | "Oldest";
    page?: number;
    size?: number;
}

// Raw shape returned by GET /api/v1/reports
export interface AdminReportResponse {
    reportId: string;
    reason: string;
    type: "Activity" | "Event";
    date: string;
    reportedBy: string;
    status: "Pending" | "Approved" | "Rejected";
}

// Shape of GET /api/v1/reports/{reportId}/summary
export interface AdminReportSummary {
    reportId: string;
    targetId: string;
    type: "Activity" | "Event";
    title: string;
    status: "Pending" | "Approved" | "Rejected";
    media: { url: string; type: MediaType }[];
    startAt: string;
    location: { district: string; commune: string; specificAddr: string } | null;
    joined: number;
    capacity: number;
    category: string;
    totalReport: number;
}

// Shape of one session inside the event content's agenda
export interface AdminReportAgendaSession {
    order: number;
    startTime: string;
    endTime: string;
    speakerName: string;
    description: string;
}

// Shape of GET /api/v1/reports/{reportId}/content -> data.detail
export interface AdminReportDetail {
    title: string;
    description: string;
    status: "Pending" | "Approved" | "Rejected";
    postBy: string;
    province: string;
    startAt: string;
    endAt: string;
    capacity: number;
    price: number;
    agenda: Record<string, AdminReportAgendaSession[]>;
}

export interface FetchRelatedReportsParams {
    publishType?: "Activity" | "Event";
    sort?: "Newest" | "Oldest";
    page?: number;
    size?: number;
}

// Shape of one item returned by GET /api/v1/reports/{reportId}/related
export interface AdminReportItem {
    reportId: string;
    reporterBy: string;
    reason: string;
    description: string;
    reportedOn: string;
    status: "Pending" | "Approved" | "Rejected";
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY DETAIL
// ─────────────────────────────────────────────────────────────────────────────

// Shape of one reports inside the activity detail
export interface ActivityReportItem {
    reportId: string;
    reporterBy: string;
    reason: string;
    details: string;
    reportedOn: string;
    status: string;
}

// Shape of one media item
export interface MediaItem {
    mediaId: string;
    type: MediaType;
    url: string;
}

// Full activity detail returned by the API. Distinct from ActivityDetail in
// activity.type.ts, which is the activity feed/profile model.
export interface ActivityReportDetail {
    activityId: string;
    content: string;
    isPublished: boolean;
    province: string;
    status: "Pending" | "Approved" | "Rejected";
    totalReports: number;
    userId: string;
    orgId: string;
    postBy: string;
    avatar: string;
    createdAt: string;
    tags: string[];
    media: MediaItem[];
    reports: PaginatedData<ActivityReportItem>;
}

// ─── Event Report Detail view model ────────────────────────────────────────────
// Composed in EventReportDetail.tsx from getReportSummary + getReportContent +
// getRelatedReports, and consumed by EventHeader/ReportTab/EventDetailsTab.
// Distinct from EventDetail (event.type.ts, the public event page model) and
// EventDetails (moderator.type.ts, the event-submission moderation model).
export interface EventReportDetail {
    eventId: string;
    id: string;
    status: "Pending" | "Approved" | "Rejected";
    name: string;
    type: string;
    date: string;
    location: string;
    joined: number;
    capacity: number;
    totalReport: number;
    image: string;
    category: string;
    reports: Report[];
    eventDetail: EventReportTabDetail;
}

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────────────────────
export interface AdminUser {
    userId: string;
    fullName: string;
    gender: string;
    email: string;
    organization: string;
    status: string;
    biography: string;
    profile: string;
}

export interface FetchUsersParams {
    status?: string;
    page?: number;
    size?: number;
}

export interface CreateUserBody {
    fullName: string;
    email: string;
    password: string;
    gender: string;
    verified: boolean;
}

export interface UpdateUserBody {
    fullName?: string;
    email?: string;
    password?: string;
    gender?: string;
    verified?: boolean;
}

// Shape of the full user detail returned by GET /api/v1/admin/users/{userId}
export interface UserDetail {
    userId: string;
    fullName: string;
    role: string;
    gender: string;
    email: string;
    biography: string;
    status: string;
    profile: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZERS
// ─────────────────────────────────────────────────────────────────────────────

// Shape of one organizer item returned by the API
export interface AdminOrganizer {
    orgId: string;
    orgName: string;
    owner: string;
    role: string;
    province: string;
    phone: string;
    submitted: string;
    email?: string;
    website?: string;
    status: string;
    bio?: string;
}

export interface FetchOrganizersParams {
    status?: string;
    search?: string;
    page?: number;
    size?: number;
}

// Shape of the full organizer detail returned by GET /api/v1/admin/organizers/{orgId}
export interface OrganizerDetail {
    orgId: string;
    orgName: string;
    owner: string;
    role: string;
    province: string;
    phone: string;
    email: string;
    website: string;
    bio: string;
    status: string;
}

export interface UpdateOrganizerBody {
    orgName?: string;
    email?: string;
    phone?: string;
    province?: string;
    website?: string;
    about?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MODERATORS
// ─────────────────────────────────────────────────────────────────────────────

// Shape of one moderator item returned by the API
export interface AdminModerator {
    userId: string;
    fullName: string;
    gender: string;
    email: string;
    province: string;
}

export interface FetchModeratorsParams {
    gender?: "Male" | "Female";
    search?: string;
    page?: number;
    size?: number;
}

export interface CreateModeratorBody {
    fullName: string;
    gender: string;
    email: string;
    password: string;
    province: string;
}

export interface UpdateModeratorBody {
    fullName?: string;
    gender?: string;
    email?: string;
    province?: string;
    password?: string;
}

// Shape of the full moderator detail returned by GET /api/v1/admin/moderators/{userId}
export interface ModeratorDetail {
    userId: string;
    fullName: string;
    role: string;
    gender: string;
    province: string;
    photo: string;
    email: string;
    bio: string;
    isVerified: boolean;
}
