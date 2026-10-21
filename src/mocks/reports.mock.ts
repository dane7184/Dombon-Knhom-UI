// Content reports for events and activities (GET /reports and the
// /reports/{reportId}/summary|content|related and /reports/activities/{id}
// endpoints). Targets reference real mock events/activities so the report
// detail pages resolve; reasons reuse src/data/mock-reports.ts.

import type { AppStatus } from "@/types/common.type";
import { mockReports as legacyReports } from "@/data/mock-reports";
import { MOCK_ACTIVITY_IDS } from "@/mocks/activities.mock";
import { findMockAccount } from "@/mocks/auth.mock";
import { MOCK_EVENT_IDS } from "@/mocks/events.mock";
import { MOCK_USER_IDS } from "@/mocks/ids";
import { isoFromNow, mockId } from "@/mocks/utils";

export type ReportType = "Event" | "Activity";

export interface MockReportRecord {
  reportId: string;
  type: ReportType;
  targetId: string;
  reporterId: string;
  reason: string;
  description: string;
  status: AppStatus;
  createdAt: string;
}

const REASONS = [...new Set(legacyReports.map((r) => r.reason))];

interface ReportSeed {
  n: number;
  type: ReportType;
  targetId: string;
  reporterId: string;
  reason: string;
  description: string;
  status: AppStatus;
  daysAgo: number;
}

function reason(name: string): string {
  return REASONS.includes(name) ? name : REASONS[0];
}

const seeds: ReportSeed[] = [
  { n: 1, type: "Event", targetId: MOCK_EVENT_IDS.rejectedRave, reporterId: MOCK_USER_IDS.chenda, reason: reason("Inappropriate"), description: "Loud party proposed inside the heritage zone.", status: "Pending", daysAgo: 4 },
  { n: 2, type: "Event", targetId: MOCK_EVENT_IDS.rejectedRave, reporterId: MOCK_USER_IDS.sreypov, reason: reason("Sensitive Topic"), description: "Disrespectful to a religious site.", status: "Pending", daysAgo: 3 },
  { n: 3, type: "Event", targetId: MOCK_EVENT_IDS.waterFestival, reporterId: MOCK_USER_IDS.pisey, reason: reason("Unverified Source"), description: "Race schedule doesn't match the official announcement.", status: "Pending", daysAgo: 2 },
  { n: 4, type: "Event", targetId: MOCK_EVENT_IDS.bonfireNight, reporterId: MOCK_USER_IDS.bora, reason: reason("Verified Information"), description: "Reported by mistake — the event details are correct.", status: "Rejected", daysAgo: 15 },
  { n: 5, type: "Event", targetId: MOCK_EVENT_IDS.charityRun, reporterId: MOCK_USER_IDS.sokha, reason: reason("Spam"), description: "The same event was posted several times.", status: "Approved", daysAgo: 45 },
  { n: 6, type: "Activity", targetId: MOCK_ACTIVITY_IDS.boatRaceVideo, reporterId: MOCK_USER_IDS.bora, reason: reason("Inappropriate"), description: "Contains offensive language in the audio.", status: "Pending", daysAgo: 1 },
  { n: 7, type: "Activity", targetId: MOCK_ACTIVITY_IDS.boatRaceVideo, reporterId: MOCK_USER_IDS.chenda, reason: reason("Spam"), description: "Reposted from another account.", status: "Pending", daysAgo: 1 },
  { n: 8, type: "Activity", targetId: MOCK_ACTIVITY_IDS.balletVideo, reporterId: MOCK_USER_IDS.pisey, reason: reason("Clickbait Title"), description: "Caption is misleading.", status: "Rejected", daysAgo: 9 },
  { n: 9, type: "Activity", targetId: mockId("4", 7), reporterId: MOCK_USER_IDS.sokha, reason: reason("Low Quality Image"), description: "Photos are blurry and unrelated.", status: "Approved", daysAgo: 20 },
  { n: 10, type: "Activity", targetId: MOCK_ACTIVITY_IDS.bonfireAnnouncement, reporterId: MOCK_USER_IDS.sreypov, reason: reason("Legitimate Promotion"), description: "Looks like an advertisement.", status: "Rejected", daysAgo: 6 },
  { n: 11, type: "Event", targetId: MOCK_EVENT_IDS.foodExpo, reporterId: MOCK_USER_IDS.chenda, reason: reason("Clickbait Title"), description: "Ticket price is different at the gate.", status: "Pending", daysAgo: 0 },
];

/** Mutable in-memory store. */
export const mockContentReports: MockReportRecord[] = seeds.map((s) => ({
  reportId: mockId("b", s.n),
  type: s.type,
  targetId: s.targetId,
  reporterId: s.reporterId,
  reason: s.reason,
  description: s.description,
  status: s.status,
  createdAt: isoFromNow(-s.daysAgo, 9 + (s.n % 8)),
}));

export function findMockReport(reportId: string): MockReportRecord | undefined {
  return mockContentReports.find((r) => r.reportId === reportId);
}

export function reportsForTarget(targetId: string): MockReportRecord[] {
  return mockContentReports.filter((r) => r.targetId === targetId);
}

export function reporterName(report: MockReportRecord): string {
  return findMockAccount(report.reporterId)?.fullName ?? "";
}

export function sortByDate<T extends { createdAt: string }>(items: T[], sort: "Newest" | "Oldest" = "Newest"): T[] {
  return [...items].sort((a, b) =>
    sort === "Oldest" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt),
  );
}
