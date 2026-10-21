import {AppBaseCategoryType, AppContentType, AppStatus , } from "@/types/common.type";



export interface ModeratorKPI {
    totalOrg: number
    totalReport: number
    totalEvent: number
}

export interface RecentPendingEvent {
    eventId: string
    eventName: string
    organizerName: string
    category: AppBaseCategoryType
    status: AppStatus
    time: string
}

export interface OrganizationRequest {
    eventId: string
    eventName: string
    organizerName: string
    category: AppBaseCategoryType
    status: AppStatus
    time: string
    totalElements?: number
    totalPages?: number
    first?: boolean
    last?: boolean
}

export interface ReportedEvent {
    eventId: string
    eventName: string
    reason: string
    reportedBy: string
    time: string
}

export interface ModeratorOverviewResponse {
    kpi: ModeratorKPI
    recentPendingEvents: RecentPendingEvent[]
    orgRequests: ModOrgCreationResponse[]
    reportedEvents: ReportedEvent[]
}

export interface ModOrgCreationResponse {
    orgId: string
    orgName: string
    phone: string
    requestBy: string
    createdAt: string
    status: AppStatus
}

export interface ModeratorEventSubmissionResponse {
    eventId: string
    eventName: string
    user: string
    category: AppBaseCategoryType
    province: string
    createdAt: string
    status: AppStatus
}

interface AgendaItem {
    startTime: string
    endTime: string
    speaker?: string | null
    description?: string | null
}

interface AgendaDay {
    date: string
    items: AgendaItem[]
}

export interface EventDetails {
    eventId: string
    image: string
    eventName: string
    requestBy: string
    requestedDate: string
    address: string
    capacity: number
    category: AppBaseCategoryType
    status: AppStatus
    description?: string | null
    tags: string[]
    agenda: AgendaDay[]
}

export interface ReportResponse {
    reportId: string
    reason: string
    type: AppContentType
    reporter: string
    createdAt: string
    status: AppStatus
}

export interface RejectReason {
    description: string
}


export interface ModOrgCreationRequestDetails {
    orgId: string
    image?: string | null
    orgName: string
    document: string
    about?: string | null
    status: AppStatus
    province: string
    phoneNumber: number
    website: string
    requestedDate: string
    submittedBy: string
}


export interface EventSubmission {
    eventId: string
    eventName: string
    user: string
    category: string
    province: string
    createdAt: string
    status: AppStatus,
    image?: string | null
}

// ---- Raw backend shapes (loosely typed JSON straight from the API) ----
// We map these into the strict domain types above. Prefer extending these
// over using `any`/`unknown` when the backend grows new fields.

// Generic envelope for list endpoints. The backend may return the rows under
// `data.content` (paginated), directly under `data`, or at the top level under
// `content`, so all three are typed here instead of falling back to `unknown`.
export interface RawListEnvelope<T> {
    success?: boolean
    message?: string | null
    data?: { content?: T[] } | T[] | null
    content?: T[]
    timestamp?: string
}

export interface RawDashboardSummary {
    totalOrg?: number
    totalOrganization?: number
    totalReport?: number
    totalReports?: number
    totalEvent?: number
    totalEvents?: number
}

export interface RawDashboardSummaryEnvelope extends RawDashboardSummary {
    data?: RawDashboardSummary
}

export interface RawPendingEvent {
    eventId?: string
    eventName?: string
    organizerName?: string
    organizer?: string
    requestBy?: string
    category?: string
    status?: string
    time?: string
    createdAt?: string
}

export interface RawReportedEvent {
    eventId?: string
    eventName?: string
    reason?: string
    reportedBy?: string
    reporter?: string
    time?: string
    createdAt?: string
}

export interface RawDashboardOrgRequest {
    eventId?: string
    orgId?: string
    eventName?: string
    orgName?: string
    organizerName?: string
    requestBy?: string
    organizer?: string
    category?: string
    status?: string
    time?: string
    createdAt?: string
}

export interface RawEventSubmission {
    eventId?: string
    eventName?: string
    user?: string
    organizerName?: string
    requestBy?: string
    category?: string
    province?: string
    submitted?: string
    createdAt?: string
    status?: string
    image?: string | null
}

export interface RawEventListResponse {
    content?: RawEventSubmission[]
    totalPages?: number
}

export interface RawCapacity {
    joined?: number
    total?: number
}

export interface RawAgendaSession {
    order?: number
    startTime?: string
    start?: string
    endTime?: string
    end?: string
    speakerName?: string | null
    speaker?: string | null
    description?: string | null
}

// New backend address shape: { district, commune, specificAddr } (any can be null)
export interface RawAddress {
    district?: string | null
    commune?: string | null
    specificAddr?: string | null
}

export interface RawEventDate {
    start?: string
    end?: string
}

export interface RawEventDetail {
    eventId?: string
    title?: string
    eventName?: string
    cover?: string | null
    image?: string | null
    requestBy?: string
    user?: string
    organizerName?: string
    requestDate?: string
    createdAt?: string
    submitted?: string
    address?: string | RawAddress | null
    location?: string
    province?: string
    capacity?: number | RawCapacity
    price?: number | null
    startAt?: string
    endAt?: string
    startDate?: string
    endDate?: string
    eventDate?: RawEventDate
    category?: string
    status?: string
    rejectedReason?: string | null
    description?: string
    tags?: string[]
    agenda?: string | Record<string, RawAgendaSession[]>
}

export interface OrgRequestDetailResponse {
    status: "Approved" | "Pending" | "Rejected";
    name: string;
    requested: string;
    logo?: string;
    province?: string;
    phone?: string;
    website?: string;
    submittedBy?: string;
    about?: string;
    documentUrl?: string;
}

export interface ModOrganizerRequest {
    orgId: string;
    orgName: string;
    phone: string;
    requestBy: string;
    submitted: string;
    status: AppStatus;
    // totalCount: number;
}

export interface RawOrgResponse {
    orgId: string;
    orgName: string;
    phone: string;
    requestBy: string;
    submitted: string;
    status: "Pending" | "Approved" | "Rejected";
}

export interface FetchOrgRequestParams {
    status?: "All" | "Approved" | "Rejected";
    sort?: "Newest" | "Oldest";
    page?: number;
    size?: number;
}

export interface ModReportManagement {
    reportId: string;
    reason: string;
    type: AppContentType;
    reporter: string | null;
    date: string;
    status: AppStatus;
}

// Raw shape of one item returned by GET /api/v1/reports
export interface RawReportResponse {
    reportId: string;
    reason: string;
    type: "Event" | "Activity";
    reportedBy: string | null;
    date: string;
    status: "Pending" | "Approved" | "Rejected";
}

export interface FetchReportParams {
    status?: "Pending" | "Approved" | "Rejected";
    sort?: "Newest" | "Oldest";
}
