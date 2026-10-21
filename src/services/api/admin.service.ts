import {
    ActivityReportDetail,
    AdminModerator,
    AdminOrganizer,
    AdminReportAgendaSession,
    AdminReportDetail,
    AdminReportItem,
    AdminReportResponse,
    AdminReportSummary,
    AdminUser,
    Category,
    CreateCategoryResponse,
    CreateModeratorBody,
    CreateUserBody,
    DeleteCategoryResponse,
    EventReportDetail as EventDetailFromService,
    FetchModeratorsParams,
    FetchOrganizersParams,
    FetchRecentUserParam,
    FetchRelatedReportsParams,
    FetchReportsParams,
    FetchTransactionsParams,
    FetchUsersParams,
    FetchWithdrawalsParams,
    ModeratorDetail,
    OrganizerDetail,
    RecentUser,
    TransactionResponse,
    UpdateCategoryResponse,
    UpdateModeratorBody,
    UpdateOrganizerBody,
    UpdateUserBody,
    UserDetail,
    WithdrawalKpi,
    WithdrawalResponse
} from "@/types/admin.type";
import {z} from "zod";
import {ApiRes, PaginatedData} from "@/types/common.type";
import {ReportResponse} from "@/types/moderator.type";
import {AgendaDay, Report} from "@/types/eventReport.type";
import {clientFetch} from "@/lib/client-fetch";
import {serverFetch} from "@/lib/server-fetch";

const DashboardStatsSchema = z.object({
    totalEvents: z.coerce.number().default(0),
    totalUsers: z.coerce.number().default(0),
    totalActivities: z.coerce.number().default(0),
    moneyEarn: z.coerce.number().default(0),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export async function getAdminKPI(accessToken: string): Promise<DashboardStats> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");

    const response = await fetch(`${baseUrl}/admin/dashboard/stats`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-cache",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch admin KPI [${response.status}]`);
    }

    const json = await response.json();
    return DashboardStatsSchema.parse(json.data);
}

export async function getCategories(accessToken: string): Promise<PaginatedData<Category>> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}categories?page=1&size=100`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
}

export async function createCategories(accessToken: string, trimmed: string): Promise<CreateCategoryResponse> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}categories`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                name: trimmed,
            }),
        },
    );

    if (!response.ok) {
        throw new Error(`Failed to create category: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
}

export async function updateCategories(accessToken: string, categoryId: string, newName: string):Promise<UpdateCategoryResponse> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}categories/${categoryId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                name: newName,
            }),
        }
    );
    if (!response.ok) {
        throw new Error(`Fail to update category: ${response.status}`);
    }
    return await response.json();
}


export async function deleteCategories(accessToken: string, categoryId: string): Promise<DeleteCategoryResponse> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}categories/${categoryId}`,
        {
            method: "DELETE",
            headers: {
                // "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
    if (!response.ok) {
        throw new Error(`Fail to delete category: ${response.status}`);
    }
    return await response.json();
}


export async function getRecentUser( accessToken?: string, params: FetchRecentUserParam = {}):Promise<RecentUser[]> {
    try {
        const { page = 0, size = 10 } = params;
        const queryParams = new URLSearchParams({
            page: String(page),
            size: String(size),
        });

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}admin/dashboard/recent-users?${queryParams.toString()}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );
        const json = await response.json();
        if (json?.success && json?.data?.content) {
            return json.data.content;
        }

        return [];
    } catch (error) {
        console.error("Failed to fetch recent user:", error);
        return [];
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function getAllTransactions(
    params: FetchTransactionsParams = {},
): Promise<PaginatedData<TransactionResponse>> {
    const { search = "", sort = "", page = 1, size = 10 } = params;

    const queryParams = new URLSearchParams({
        search,
        sort,
        page: String(page),
        size: String(size),
    });

    const res = await clientFetch(`admin/transactions?${queryParams.toString()}`);
    if (!res.ok) throw res;

    const json: ApiRes<PaginatedData<TransactionResponse>> = await res.json();
    return json.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// WITHDRAWALS
// ─────────────────────────────────────────────────────────────────────────────

export async function getWithdrawals(
    params: FetchWithdrawalsParams = {},
): Promise<WithdrawalResponse[]> {
    const { status = "Pending", sort = "Newest", page = 1, size = 10 } = params;

    const queryParams = new URLSearchParams({
        status,
        sort,
        page: String(page),
        size: String(size),
    });

    const res = await clientFetch(`admin/withdrawals?${queryParams.toString()}`);
    if (!res.ok) throw res;

    const json: ApiRes<PaginatedData<WithdrawalResponse>> = await res.json();
    return json.data.content;
}

// Called from a server component, so it goes through serverFetch instead.
export async function getWithdrawalKpi(): Promise<WithdrawalKpi | null> {
    const res = await serverFetch("admin/withdrawals/stats");
    if (!res.ok) return null;

    const json: ApiRes<WithdrawalKpi> = await res.json();
    return json.data;
}

export async function updateWithdrawalStatus(
    withdrawalId: string,
    status: "Approved" | "Rejected",
    transactionRef?: string,
    proof?: File,
): Promise<void> {
    const formData = new FormData();
    formData.append("status", status);
    if (transactionRef) formData.append("transactionRef", transactionRef);
    if (proof) formData.append("proof", proof);

    const res = await clientFetch(`admin/withdrawals/${withdrawalId}/status`, {
        method: "PATCH",
        body: formData,
    });
    if (!res.ok) throw res;
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────────────────────────────────────

function buildReportsQuery(params: FetchReportsParams): URLSearchParams {
    const { type, status, sort = "Newest", page = 1, size = 10 } = params;

    const queryParams = new URLSearchParams({
        sort,
        page: String(page),
        size: String(size),
    });
    if (type) queryParams.set("type", type);
    if (status) queryParams.set("status", status);

    return queryParams;
}

function mapReportsResponse(json: ApiRes<PaginatedData<AdminReportResponse>>): PaginatedData<ReportResponse> {
    const { content, ...pageInfo } = json.data;

    return {
        ...pageInfo,
        content: content.map(
            (item): ReportResponse => ({
                reportId: item.reportId,
                reason: item.reason,
                reporter: item.reportedBy,
                type: item.type,
                createdAt: item.date,
                status: item.status,
            }),
        ),
    };
}

export async function getReports(
    params: FetchReportsParams = {},
): Promise<PaginatedData<ReportResponse>> {
    const queryParams = buildReportsQuery(params);

    const res = await clientFetch(`reports?${queryParams.toString()}`);
    if (!res.ok) throw res;

    return mapReportsResponse(await res.json());
}

// Called from a server component for the initial render of the reports list.
export async function getReportsServer(
    params: FetchReportsParams = {},
): Promise<PaginatedData<ReportResponse>> {
    const queryParams = buildReportsQuery(params);

    const res = await serverFetch(`reports?${queryParams.toString()}`, { cache: "no-store" } as RequestInit);
    if (!res.ok) throw res;

    return mapReportsResponse(await res.json());
}

// PATCH /api/v1/admin/reports/{reportId}/status
export async function updateReportStatus(
    reportId: string,
    status: "Approved" | "Rejected",
): Promise<void> {
    const res = await clientFetch(`admin/reports/${reportId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
    if (!res.ok) throw res;
}

// GET /api/v1/reports/{reportId}/summary
export async function getReportSummary(reportId: string): Promise<AdminReportSummary> {
    const res = await clientFetch(`reports/${reportId}/summary`);
    if (!res.ok) throw res;

    const json: ApiRes<AdminReportSummary> = await res.json();
    return json.data;
}

export async function getReportSummaryServer(reportId: string): Promise<AdminReportSummary> {
    const res = await serverFetch(`reports/${reportId}/summary`, { cache: "no-store" } as RequestInit);
    if (!res.ok) throw res;

    const json: ApiRes<AdminReportSummary> = await res.json();
    return json.data;
}

function buildReportContentQuery(sort?: "Newest" | "Oldest"): string {
    const queryParams = new URLSearchParams();
    if (sort) queryParams.set("sort", sort);
    return queryParams.toString() ? `?${queryParams.toString()}` : "";
}

// GET /api/v1/reports/{reportId}/content
export async function getReportContent(
    reportId: string,
    sort?: "Newest" | "Oldest",
): Promise<AdminReportDetail> {
    const res = await clientFetch(`reports/${reportId}/content${buildReportContentQuery(sort)}`);
    if (!res.ok) throw res;

    const json: ApiRes<{ detail: AdminReportDetail }> = await res.json();
    return json.data.detail;
}

export async function getReportContentServer(
    reportId: string,
    sort?: "Newest" | "Oldest",
): Promise<AdminReportDetail> {
    const res = await serverFetch(`reports/${reportId}/content${buildReportContentQuery(sort)}`, { cache: "no-store" } as RequestInit);
    if (!res.ok) throw res;

    const json: ApiRes<{ detail: AdminReportDetail }> = await res.json();
    return json.data.detail;
}

function buildRelatedReportsQuery(params: FetchRelatedReportsParams): URLSearchParams {
    const { publishType, sort = "Newest", page = 1, size = 10 } = params;

    const queryParams = new URLSearchParams({
        sort,
        page: String(page),
        size: String(size),
    });
    if (publishType) queryParams.set("publishType", publishType);

    return queryParams;
}

// GET /api/v1/reports/{reportId}/related
export async function getRelatedReports(
    reportId: string,
    params: FetchRelatedReportsParams = {},
): Promise<PaginatedData<AdminReportItem>> {
    const res = await clientFetch(`reports/${reportId}/related?${buildRelatedReportsQuery(params).toString()}`);
    if (!res.ok) throw res;

    const json: ApiRes<PaginatedData<AdminReportItem>> = await res.json();
    return json.data;
}

export async function getRelatedReportsServer(
    reportId: string,
    params: FetchRelatedReportsParams = {},
): Promise<PaginatedData<AdminReportItem>> {
    const res = await serverFetch(`reports/${reportId}/related?${buildRelatedReportsQuery(params).toString()}`, { cache: "no-store" } as RequestInit);
    if (!res.ok) throw res;

    const json: ApiRes<PaginatedData<AdminReportItem>> = await res.json();
    return json.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY DETAIL
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/reports/activities/{activityId}
export async function getActivityReportDetail(activityId: string): Promise<ActivityReportDetail> {
    const res = await clientFetch(`reports/activities/${activityId}`);
    if (!res.ok) throw res;

    const json: ApiRes<ActivityReportDetail> = await res.json();
    return json.data;
}

export async function getActivityReportDetailServer(activityId: string): Promise<ActivityReportDetail> {
    const res = await serverFetch(`reports/activities/${activityId}`, { cache: "no-store" } as RequestInit);
    if (!res.ok) throw res;

    const json: ApiRes<ActivityReportDetail> = await res.json();
    return json.data;
}

export async function getActivityFullReportDetail(reportId: string): Promise<ActivityReportDetail> {
    const [summary, content] = await Promise.all([
        getReportSummary(reportId),
        getReportContent(reportId),
    ]);
    const activity = await getActivityReportDetail(summary.targetId);
    return {...activity, status: summary.status};
}

export async function getActivityFullReportDetailServer(reportId: string): Promise<ActivityReportDetail> {
    const [summary, content] = await Promise.all([
        getReportSummaryServer(reportId),
        getReportContentServer(reportId),
    ]);
    const activity = await getActivityReportDetailServer(summary.targetId);
    return {...activity, status: summary.status};
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT REPORT DETAIL (composed view model)
// ─────────────────────────────────────────────────────────────────────────────

function mapAgenda(agenda: Record<string, AdminReportAgendaSession[]>): AgendaDay[] {
    return Object.entries(agenda).map(([date, sessions], index) => ({
        day: index + 1,
        date,
        items: sessions
            .sort((a, b) => a.order - b.order)
            .map((session) => ({
                start: session.startTime,
                end: session.endTime,
                speaker: session.speakerName,
                description: session.description,
                duration: formatDuration(session.startTime, session.endTime),
            })),
    }));
}

function formatDuration(start: string, end: string): string {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    let minutes = endH * 60 + endM - (startH * 60 + startM);
    if (minutes < 0) minutes += 24 * 60;

    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;

    if (hours > 0 && remainder > 0) return `${hours}h ${remainder}m`;
    if (hours > 0) return `${hours}h`;
    return `${remainder}m`;
}

function formatPrice(price: number): string {
    return price === 0 ? "Free" : `$${price}`;
}

function formatAddress(
    location: { district: string; commune: string; specificAddr: string } | null,
): string {
    if (!location) return "N/A";
    return [location.specificAddr, location.commune, location.district]
        .filter(Boolean)
        .join(", ");
}

// Exported so the mock service can build the same view model from mock data.
export function assembleEventDetail(
    summary: AdminReportSummary,
    content: AdminReportDetail,
    related: PaginatedData<AdminReportItem>,
): EventDetailFromService {
    const reports: Report[] = related.content.map((item) => ({
        id: item.reportId,
        reporterBy: item.reporterBy,
        reason: item.reason,
        description: item.description,
        reportedOn: item.reportedOn,
    }));

    return {
        eventId: summary.targetId,
        id: summary.targetId,
        status: summary.status,
        name: summary.title,
        type: summary.type,
        date: summary.startAt,
        location: formatAddress(summary.location),
        joined: summary.joined,
        capacity: summary.capacity,
        totalReport: summary.totalReport,
        image: summary.media[0]?.url ?? "",
        category: summary.category,
        reports,
        eventDetail: {
            title: content.title,
            description: content.description,
            hashtags: [],
            agenda: mapAgenda(content.agenda),
            reportSummary: {
                postBy: content.postBy,
                eventDate: content.startAt,
                province: content.province,
                capacity: content.capacity,
                price: formatPrice(content.price),
                status: summary.status,
            },
        },
    };
}

// Resolves a reports's summary + content + related reports into the EventDetail
// view model. Used for the event reports detail page (server initial render and
// client refetch).
export async function getEventReportDetail(reportId: string): Promise<EventDetailFromService | null> {
    const [summary, content, related] = await Promise.all([
        getReportSummary(reportId),
        getReportContent(reportId),
        getRelatedReports(reportId, { publishType: "Event", size: 20 }),
    ]);

    if (!summary || !content) return null;
    return assembleEventDetail(summary, content, related);
}

export async function getEventReportDetailServer(reportId: string): Promise<EventDetailFromService | null> {
    const [summary, content, related] = await Promise.all([
        getReportSummaryServer(reportId),
        getReportContentServer(reportId),
        getRelatedReportsServer(reportId, { publishType: "Event", size: 100 }),
    ]);

    if (!summary || !content) return null;
    return assembleEventDetail(summary, content, related);
}

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────────────────────

export async function getAllUsers(
    params: FetchUsersParams = {},
): Promise<PaginatedData<AdminUser>> {
    const { status, page = 1, size = 10 } = params;

    const queryParams = new URLSearchParams({
        page: String(page),
        size: String(size),
    });
    if (status) queryParams.set("status", status);

    const res = await clientFetch(`admin/users?${queryParams.toString()}`);
    if (!res.ok) throw res;

    const json: ApiRes<PaginatedData<AdminUser>> = await res.json();
    return json.data;
}

// POST /api/v1/admin/users
export async function createUser(body: CreateUserBody): Promise<void> {
    const res = await clientFetch("admin/users", {
        method: "POST",
        body: JSON.stringify(body),
    });
    if (!res.ok) throw res;
}

// PATCH /api/v1/admin/users/{userId}
export async function updateUser(userId: string, body: UpdateUserBody): Promise<void> {
    const res = await clientFetch(`admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
    });
    if (!res.ok) throw res;
}

// DELETE /api/v1/admin/users/{userId}
export async function deleteUser(userId: string): Promise<void> {
    const res = await clientFetch(`admin/users/${userId}`, { method: "DELETE" });
    if (!res.ok) throw res;
}

// GET /api/v1/admin/users/{userId}
export async function getUserById(userId: string): Promise<UserDetail> {
    const res = await clientFetch(`admin/users/${userId}`);
    if (!res.ok) throw res;

    const json: ApiRes<UserDetail> = await res.json();
    return json.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZERS
// ─────────────────────────────────────────────────────────────────────────────

export async function getAllOrganizers(
    params: FetchOrganizersParams = {},
): Promise<PaginatedData<AdminOrganizer>> {
    const { status, search, page = 1, size = 10 } = params;

    const queryParams = new URLSearchParams({
        page: String(page),
        size: String(size),
    });
    if (status) queryParams.set("status", status);
    if (search) queryParams.set("search", search);

    const res = await clientFetch(`admin/organizers?${queryParams.toString()}`);
    if (!res.ok) throw res;

    const json: ApiRes<PaginatedData<AdminOrganizer>> = await res.json();
    return json.data;
}

// GET /api/v1/admin/organizers/{orgId}
export async function getOrganizerById(orgId: string): Promise<OrganizerDetail> {
    const res = await clientFetch(`admin/organizers/${orgId}`);
    if (!res.ok) throw res;

    const json: ApiRes<OrganizerDetail> = await res.json();
    return json.data;
}

// DELETE /api/v1/admin/organizers/{orgId}
export async function deleteOrganizer(orgId: string): Promise<void> {
    const res = await clientFetch(`admin/organizers/${orgId}`, { method: "DELETE" });
    if (!res.ok) throw res;
}

// PATCH /api/v1/admin/organizations/{orgId}
export async function updateOrganizer(orgId: string, body: UpdateOrganizerBody): Promise<void> {
    const res = await clientFetch(`admin/organizations/${orgId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
    });
    if (!res.ok) throw res;
}

// ─────────────────────────────────────────────────────────────────────────────
// MODERATORS
// ─────────────────────────────────────────────────────────────────────────────

export async function getAllModerators(
    params: FetchModeratorsParams = {},
): Promise<PaginatedData<AdminModerator>> {
    const { gender, search, page = 1, size = 10 } = params;

    const queryParams = new URLSearchParams({
        page: String(page),
        size: String(size),
    });
    if (gender) queryParams.set("gender", gender);
    if (search) queryParams.set("search", search);

    const res = await clientFetch(`admin/moderators?${queryParams.toString()}`);
    if (!res.ok) throw res;

    const json: ApiRes<PaginatedData<AdminModerator>> = await res.json();
    return json.data;
}

// POST /api/v1/admin/moderators
export async function createModerator(body: CreateModeratorBody): Promise<void> {
    const res = await clientFetch("admin/moderators", {
        method: "POST",
        body: JSON.stringify(body),
    });
    if (!res.ok) throw res;
}

// PATCH /api/v1/admin/moderators/{userId}
export async function updateModerator(userId: string, body: UpdateModeratorBody): Promise<void> {
    const res = await clientFetch(`admin/moderators/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
    });
    if (!res.ok) throw res;
}

// DELETE /api/v1/admin/moderators/{userId}
export async function deleteModerator(userId: string): Promise<void> {
    const res = await clientFetch(`admin/moderators/${userId}`, { method: "DELETE" });
    if (!res.ok) throw res;
}

// GET /api/v1/admin/moderators/{userId}
export async function getModeratorById(userId: string): Promise<ModeratorDetail> {
    const res = await clientFetch(`admin/moderators/${userId}`);
    if (!res.ok) throw res;

    const json: ApiRes<ModeratorDetail> = await res.json();
    return json.data;
}

