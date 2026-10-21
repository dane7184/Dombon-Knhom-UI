import {
    EventSubmission,
    FetchOrgRequestParams,
    FetchReportParams,
    ModeratorKPI,
    ModOrganizerRequest,
    ModReportManagement,
    OrganizationRequest,
    RawAddress,
    RawAgendaSession,
    RawDashboardOrgRequest,
    RawDashboardSummaryEnvelope,
    RawEventDetail,
    RawEventListResponse,
    RawEventSubmission,
    RawListEnvelope,
    RawOrgResponse,
    RawPendingEvent,
    RawReportResponse,
    RawReportedEvent,
    RecentPendingEvent,
    ReportedEvent,
} from "@/types/moderator.type";
import type { Event } from "@/app/(dashboard)/moderator/event-submissions/[id]/page";
import { Agenda } from "@/types/event.type";
import { ApiRes, AppBaseCategoryType, AppStatus, PaginatedData } from "@/types/common.type";
import { serverFetch } from "@/lib/server-fetch";
import { clientFetch } from "@/lib/client-fetch";

function extractContent<T>(json: RawListEnvelope<T>): T[] {
    const data = json.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    if (Array.isArray(json.content)) return json.content;
    return [];
}

export async function getOrganizerRequest(
    params: FetchOrgRequestParams = {},
): Promise<ModOrganizerRequest[]> {
    try {
        const { status, sort = "Newest", page = 1, size = 10 } = params;
        const queryParams = new URLSearchParams({
            sort,
            page: String(page),
            size: String(size),
        });
        if (status) queryParams.set("status", status);

        const response = await serverFetch(`moderator/organizers?${queryParams.toString()}`);
        const json: RawListEnvelope<RawOrgResponse> & { success?: boolean } =
            await response.json();

        if (json?.success && json?.data && !Array.isArray(json.data) && json.data.content) {
            return json.data.content.map(
                (item): ModOrganizerRequest => ({
                    orgId: item.orgId,
                    orgName: item.orgName,
                    phone: item.phone,
                    requestBy: item.requestBy,
                    submitted: item.submitted,
                    status: item.status,
                }),
            );
        }

        return [];
    } catch (error) {
        console.error("Failed to fetch organizer request:", error);
        return [];
    }
}

function mapReportManagement(item: RawReportResponse): ModReportManagement {
    return {
        reportId: item.reportId,
        reason: item.reason,
        type: item.type,
        reporter: item.reportedBy,
        date: item.date,
        status: item.status,
    };
}

// Loops through every server page (province-scoped, so the result set is
// small) since the report-management UI filters/paginates client-side.
export async function getReportManagement(
    params: FetchReportParams = {},
): Promise<ModReportManagement[]> {
    try {
        const { status, sort = "Newest" } = params;
        const size = 100;
        const all: ModReportManagement[] = [];
        let page = 1;
        let totalPages = 1;

        do {
            const queryParams = new URLSearchParams({
                sort,
                page: String(page),
                size: String(size),
            });
            if (status) queryParams.set("status", status);

            const response = await serverFetch(`reports?${queryParams.toString()}`);
            const json: ApiRes<PaginatedData<RawReportResponse>> = await response.json();
            if (!json?.success || !json?.data?.content) break;

            all.push(...json.data.content.map(mapReportManagement));
            totalPages = json.data.totalPages ?? 1;
            page += 1;
        } while (page <= totalPages);

        return all;
    } catch (error) {
        console.error("Failed to fetch reports management:", error);
        return [];
    }
}

export async function getDashboardSummary(): Promise<ModeratorKPI> {
    try {
        const res = await serverFetch(`moderator/dashboard/summary`);
        const json: RawDashboardSummaryEnvelope = await res.json();
        const d = json?.data ?? json;
        return {
            totalOrg: d?.totalOrg ?? d?.totalOrganization ?? 0,
            totalReport: d?.totalReport ?? d?.totalReports ?? 0,
            totalEvent: d?.totalEvent ?? d?.totalEvents ?? 0,
        };
    } catch {
        return { totalOrg: 0, totalReport: 0, totalEvent: 0 };
    }
}

export async function getDashboardPendingEvents(): Promise<RecentPendingEvent[]> {
    try {
        const res = await serverFetch(`moderator/dashboard/pending-events`);
        const json: RawListEnvelope<RawPendingEvent> = await res.json();
        return extractContent(json).map(
            (item): RecentPendingEvent => ({
                eventId: item.eventId ?? "",
                eventName: item.eventName ?? "",
                organizerName: item.organizerName ?? item.organizer ?? item.requestBy ?? "",
                category: (item.category ?? "Other") as AppBaseCategoryType,
                status: (item.status ?? "Pending") as AppStatus,
                time: item.time ?? item.createdAt ?? "",
            }),
        );
    } catch {
        return [];
    }
}

export async function getDashboardReportedEvents(): Promise<ReportedEvent[]> {
    try {
        const res = await serverFetch(`moderator/dashboard/reported-events`);
        const json: RawListEnvelope<RawReportedEvent> = await res.json();
        return extractContent(json).map(
            (item): ReportedEvent => ({
                eventId: item.eventId ?? "",
                eventName: item.eventName ?? "",
                reason: item.reason ?? "",
                reportedBy: item.reportedBy ?? item.reporter ?? "",
                time: item.time ?? item.createdAt ?? "",
            }),
        );
    } catch {
        return [];
    }
}

export async function getDashboardOrganizerRequests(): Promise<OrganizationRequest[]> {
    try {
        const res = await serverFetch(`moderator/dashboard/organizer-requests`);
        const json: RawListEnvelope<RawDashboardOrgRequest> = await res.json();
        return extractContent(json).map(
            (item): OrganizationRequest => ({
                eventId: item.eventId ?? item.orgId ?? "",
                eventName: item.eventName ?? item.orgName ?? "",
                organizerName: item.organizerName ?? item.requestBy ?? item.organizer ?? "",
                category: (item.category ?? "Other") as AppBaseCategoryType,
                status: (item.status ?? "Pending") as AppStatus,
                time: item.time ?? item.createdAt ?? "",
            }),
        );
    } catch {
        return [];
    }
}


function toUiStatus(status?: string): EventSubmission["status"] {
    if (status === "Published") return "Approved";
    if (status === "Rejected") return "Rejected";
    return "Pending";
}

function mapEventSubmission(item: RawEventSubmission): EventSubmission {
    return {
        eventId: item.eventId ?? "",
        eventName: item.eventName ?? "",
        user: item.user ?? item.organizerName ?? item.requestBy ?? "",
        category: item.category ?? "Other",
        province: (item.province ?? "").replace(/_/g, " "),
        createdAt: item.submitted ?? item.createdAt ?? "",
        status: toUiStatus(item.status),
        image: item.image ?? null,
    };
}

export async function getEventSubmissions(): Promise<EventSubmission[]> {
    try {
        const size = 100;
        const all: EventSubmission[] = [];
        let page = 0;
        let totalPages = 1;

        do {
            const res = await clientFetch(`moderator/events?page=${page}&size=${size}`);
            const json = (await res.json()) as ApiRes<RawEventListResponse>;
            const data = json?.data;
            const items = data?.content ?? [];
            all.push(...items.map(mapEventSubmission));
            totalPages = data?.totalPages ?? 1;
            page += 1;
        } while (page < totalPages);

        return all;
    } catch {
        return [];
    }
}

function parseAgendaMap(
    raw?: string | Record<string, RawAgendaSession[]>,
): Record<string, RawAgendaSession[]> {
    if (!raw) return {};
    if (typeof raw === "string") {
        try {
            const parsed: unknown = JSON.parse(raw);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                return parsed as Record<string, RawAgendaSession[]>;
            }
            return {};
        } catch {
            return {};
        }
    }
    return raw;
}

function formatAddress(
    address?: string | RawAddress | null,
    province?: string,
): string {
    const cleanProvince = province ? province.replace(/_/g, " ") : "";
    if (typeof address === "string") {
        return [address, cleanProvince].filter(Boolean).join(", ");
    }
    return [
        address?.specificAddr,
        address?.commune,
        address?.district,
        cleanProvince,
    ]
        .filter(Boolean)
        .join(", ");
}

function formatDisplayDate(value?: string): string {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function toEventDetail(item: RawEventDetail, fallbackId: string): Event {
    const capacityRaw = item.capacity;
    let capacity = { joined: 0, total: 0 };
    if (typeof capacityRaw === "number") {
        capacity = { joined: 0, total: capacityRaw };
    } else if (capacityRaw) {
        capacity = { joined: capacityRaw.joined ?? 0, total: capacityRaw.total ?? 0 };
    }

    const eventDate = {
        start: formatDisplayDate(item.startAt ?? item.eventDate?.start ?? item.startDate),
        end: formatDisplayDate(item.endAt ?? item.eventDate?.end ?? item.endDate),
    };

    const agendaMap = parseAgendaMap(item.agenda);
    const agenda: Agenda = Object.fromEntries(
        Object.entries(agendaMap).map(([date, sessionsRaw]) => {
            const sessions = (Array.isArray(sessionsRaw) ? sessionsRaw : [])
                .slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            return [
                date,
                sessions.map((session, index) => ({
                    order: session.order ?? index,
                    startTime: session.startTime ?? session.start ?? "",
                    endTime: session.endTime ?? session.end ?? "",
                    speakerName: session.speakerName ?? session.speaker ?? "",
                    description: session.description ?? "",
                })),
            ];
        }),
    );

    return {
        eventId: item.eventId ?? fallbackId,
        eventName: item.title ?? item.eventName ?? "",
        image: item.cover || item.image || "/images/default-fallback-image.png",
        user: item.requestBy ?? item.user ?? item.organizerName ?? "",
        createdAt: item.requestDate ?? item.createdAt ?? item.submitted ?? "",
        location: formatAddress(item.address, item.province) || item.location || "",
        province: item.province ? item.province.replace(/_/g, " ") : undefined,
        capacity,
        price: typeof item.price === "number" ? item.price : null,
        eventDate,
        category: (item.category ?? "Other") as AppBaseCategoryType,
        status: toUiStatus(item.status),
        rejectedReason: item.rejectedReason ?? null,
        description: item.description ?? "",
        tags: item.tags ?? [],
        agenda,
    };
}

export async function getEventDetail(eventId: string): Promise<Event | null> {
    try {
        const res = await clientFetch(`moderator/events/${eventId}`);
        const json = (await res.json()) as ApiRes<RawEventDetail>;
        const data = json?.data;
        if (!data) return null;
        return toEventDetail(data, eventId);
    } catch {
        return null;
    }
}

export async function patchEventStatus(
    eventId: string,
    status: "Approved" | "Rejected",
    reason?: string,
): Promise<boolean> {
    try {
        const body =
            status === "Approved"
                ? { action: "Published" }
                : { action: "Rejected", reason };
        const res = await clientFetch(`moderator/events/${eventId}`, {
            method: "PATCH",
            body: JSON.stringify(body),
        });
        return res.ok;
    } catch {
        return false;
    }
}

export async function reviewReportModerator(
    reportId: string,
    action: "Approved" | "Rejected",
): Promise<void> {
    const res = await clientFetch(`moderator/reports/${reportId}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
    });
    if (!res.ok) throw res;
}
