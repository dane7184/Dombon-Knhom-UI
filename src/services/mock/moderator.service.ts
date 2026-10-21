// Mock implementation of services/api/moderator.service.ts.
// Event submissions are the shared mock events, so approving/rejecting one
// here changes what the organizer dashboard and public pages show (in memory).

import type {
  EventSubmission,
  FetchOrgRequestParams,
  FetchReportParams,
  ModeratorKPI,
  ModOrganizerRequest,
  ModReportManagement,
  OrganizationRequest,
  RecentPendingEvent,
  ReportedEvent,
} from "@/types/moderator.type";
import type { Event } from "@/app/(dashboard)/moderator/event-submissions/[id]/page";
import type { AppBaseCategoryType } from "@/types/common.type";
import { findMockAccount, findMockOrganization } from "@/mocks/auth.mock";
import { findMockEvent, mockEvents, type MockEventRecord } from "@/mocks/events.mock";
import { mockOrgRequests } from "@/mocks/org-requests.mock";
import { findMockReport, mockContentReports, reporterName, sortByDate } from "@/mocks/reports.mock";
import { logMockWrite, mockRequest, offsetPage } from "@/mocks/utils";

function submitterName(e: MockEventRecord): string {
  return findMockOrganization(e.orgId)?.name ?? findMockAccount(e.userId)?.fullName ?? "";
}

function provinceLabel(province: string): string {
  return province.replace(/_/g, " ");
}

function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export async function getOrganizerRequest(params: FetchOrgRequestParams = {}): Promise<ModOrganizerRequest[]> {
  await mockRequest("moderator.orgRequests");
  const { status, sort = "Newest", page = 1, size = 10 } = params;
  const filtered = mockOrgRequests.filter((r) => !status || status === "All" || r.status === status);
  const sorted = sortByDate(filtered.map((r) => ({ ...r, createdAt: r.submitted })), sort);
  return offsetPage(sorted, page, size).content.map((r) => ({
    orgId: r.orgId,
    orgName: r.orgName,
    phone: r.phone,
    requestBy: r.requestBy,
    submitted: r.submitted,
    status: r.status,
  }));
}

export async function getReportManagement(params: FetchReportParams = {}): Promise<ModReportManagement[]> {
  await mockRequest("moderator.reports");
  const { status, sort = "Newest" } = params;
  return sortByDate(mockContentReports.filter((r) => !status || r.status === status), sort).map((r) => ({
    reportId: r.reportId,
    reason: r.reason,
    type: r.type,
    reporter: reporterName(r) || null,
    date: r.createdAt,
    status: r.status,
  }));
}

export async function getDashboardSummary(): Promise<ModeratorKPI> {
  await mockRequest("moderator.summary");
  return {
    totalOrg: mockOrgRequests.length,
    totalReport: mockContentReports.length,
    totalEvent: mockEvents.length,
  };
}

export async function getDashboardPendingEvents(): Promise<RecentPendingEvent[]> {
  await mockRequest("moderator.pendingEvents");
  return sortByDate(mockEvents.filter((e) => e.status === "Pending")).map((e) => ({
    eventId: e.eventId,
    eventName: e.title,
    organizerName: submitterName(e),
    category: e.categoryName as AppBaseCategoryType,
    status: e.status,
    time: e.createdAt,
  }));
}

export async function getDashboardReportedEvents(): Promise<ReportedEvent[]> {
  await mockRequest("moderator.reportedEvents");
  return sortByDate(mockContentReports.filter((r) => r.type === "Event")).map((r) => ({
    eventId: r.targetId,
    eventName: findMockEvent(r.targetId)?.title ?? "",
    reason: r.reason,
    reportedBy: reporterName(r),
    time: r.createdAt,
  }));
}

export async function getDashboardOrganizerRequests(): Promise<OrganizationRequest[]> {
  await mockRequest("moderator.orgRequests");
  return sortByDate(
    mockOrgRequests.filter((r) => r.status === "Pending").map((r) => ({ ...r, createdAt: r.submitted })),
  ).map((r) => ({
    eventId: r.orgId,
    eventName: r.orgName,
    organizerName: r.requestBy,
    category: "Other" as AppBaseCategoryType,
    status: r.status,
    time: r.submitted,
  }));
}

export async function getEventSubmissions(): Promise<EventSubmission[]> {
  await mockRequest("moderator.events");
  return sortByDate(mockEvents).map((e) => ({
    eventId: e.eventId,
    eventName: e.title,
    user: submitterName(e),
    category: e.categoryName,
    province: provinceLabel(e.province),
    createdAt: e.createdAt,
    status: e.status,
    image: e.cover,
  }));
}

export async function getEventDetail(eventId: string): Promise<Event | null> {
  await mockRequest("moderator.eventDetail");
  const e = findMockEvent(eventId);
  if (!e) return null;
  return {
    eventId: e.eventId,
    eventName: e.title,
    image: e.cover,
    user: submitterName(e),
    createdAt: e.createdAt,
    location: [e.address.specificAddr, e.address.commune, e.address.district, provinceLabel(e.province)]
      .filter(Boolean)
      .join(", "),
    province: provinceLabel(e.province),
    capacity: { joined: e.attendeeCount, total: e.capacity ?? 0 },
    price: e.price,
    eventDate: { start: formatDisplayDate(e.startAt), end: formatDisplayDate(e.endAt) },
    category: e.categoryName as AppBaseCategoryType,
    status: e.status,
    rejectedReason: e.rejectedReason,
    description: e.description,
    tags: [],
    agenda: structuredClone(e.agenda),
  };
}

export async function patchEventStatus(
  eventId: string,
  status: "Approved" | "Rejected",
  reason?: string,
): Promise<boolean> {
  await mockRequest("moderator.eventStatus");
  const e = findMockEvent(eventId);
  if (!e) return false;
  e.status = status;
  e.rejectedReason = status === "Rejected" ? (reason ?? null) : null;
  e.reviewedAt = new Date().toISOString();
  logMockWrite("patchEventStatus", { eventId, status });
  return true;
}

export async function reviewReportModerator(reportId: string, action: "Approved" | "Rejected"): Promise<void> {
  await mockRequest("moderator.reportReview");
  const report = findMockReport(reportId);
  if (!report) throw new Response(null, { status: 404 });
  report.status = action;
  logMockWrite("reviewReport", { reportId, action });
}
