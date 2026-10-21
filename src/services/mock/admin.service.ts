// Mock implementation of services/api/admin.service.ts.
// Same exported names and compatible signatures (unused trailing parameters
// such as tokens are omitted); the *Server variants share the client logic.
// Writes only change in-memory mock state.

import type {
  ActivityReportDetail,
  ActivityReportItem,
  AdminModerator,
  AdminOrganizer,
  AdminReportDetail,
  AdminReportItem,
  AdminReportSummary,
  AdminUser,
  Category,
  CreateCategoryResponse,
  CreateModeratorBody,
  CreateUserBody,
  DeleteCategoryResponse,
  EventReportDetail,
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
  WithdrawalResponse,
} from "@/types/admin.type";
import type { PaginatedData, Role } from "@/types/common.type";
import type { ReportResponse } from "@/types/moderator.type";
import { assembleEventDetail, type DashboardStats } from "@/services/api/admin.service";
import { mockActivities, findMockActivity } from "@/mocks/activities.mock";
import { mockAdminPayments, mockAdminUsers, mockModerators } from "@/mocks/admin.mock";
import { MOCK_AVATARS } from "@/mocks/assets";
import { findMockAccount, findMockOrganization } from "@/mocks/auth.mock";
import { mockCategories } from "@/mocks/categories.mock";
import { findMockEvent, mockEvents } from "@/mocks/events.mock";
import { findMockOrgRequest, mockOrgRequests } from "@/mocks/org-requests.mock";
import { findMockOrganizationProfile } from "@/mocks/organizer.mock";
import {
  findMockReport,
  mockContentReports,
  reporterName,
  reportsForTarget,
  sortByDate,
  type MockReportRecord,
} from "@/mocks/reports.mock";
import { mockAdminWithdrawals, toWithdrawalResponse } from "@/mocks/withdrawals.mock";
import { apiErrorResponse, logMockWrite, mockRequest, nextMockId, offsetPage } from "@/mocks/utils";

export { assembleEventDetail };

function notFound(what: string): Response {
  return apiErrorResponse(404, `${what} not found`);
}

function withTotalCount<T>(page: PaginatedData<T>): PaginatedData<T & { totalCount: number }> {
  return { ...page, content: page.content.map((item) => ({ ...item, totalCount: page.totalElements })) };
}

function contentAuthorName(orgId: string | null, userId: string | null): string {
  return findMockOrganization(orgId)?.name ?? findMockAccount(userId)?.fullName ?? "";
}

// ── Dashboard & categories ───────────────────────────────────

export async function getAdminKPI(): Promise<DashboardStats> {
  await mockRequest("admin.kpi");
  return {
    totalEvents: mockEvents.length,
    totalUsers: mockAdminUsers.length,
    totalActivities: mockActivities.length,
    moneyEarn: mockAdminPayments.reduce((sum, p) => sum + p.amount, 0),
  };
}

export async function getCategories(): Promise<PaginatedData<Category>> {
  await mockRequest("admin.categories");
  return withTotalCount(offsetPage(mockCategories.map((c) => ({ categoryId: c.categoryId, name: c.name })), 1, 100));
}

export async function createCategories(_accessToken: string, trimmed: string): Promise<CreateCategoryResponse> {
  await mockRequest("admin.categories.create");
  const name = trimmed.trim();
  if (!name) throw new Error("Failed to create category: 400");
  if (mockCategories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
    throw new Error("Failed to create category: 409");
  }
  const categoryId = nextMockId("8");
  mockCategories.push({ categoryId, name });
  logMockWrite("createCategory", { categoryId, name });
  return { categoryId };
}

export async function updateCategories(
  _accessToken: string,
  categoryId: string,
  newName: string,
): Promise<UpdateCategoryResponse> {
  await mockRequest("admin.categories.update");
  const category = mockCategories.find((c) => c.categoryId === categoryId);
  if (!category) throw new Error("Fail to update category: 404");
  category.name = newName.trim();
  logMockWrite("updateCategory", { categoryId, name: category.name });
  return { success: true, message: "Category updated successfully", data: { ...category } };
}

export async function deleteCategories(_accessToken: string, categoryId: string): Promise<DeleteCategoryResponse> {
  await mockRequest("admin.categories.delete");
  const index = mockCategories.findIndex((c) => c.categoryId === categoryId);
  if (index === -1) throw new Error("Fail to delete category: 404");
  mockCategories.splice(index, 1);
  logMockWrite("deleteCategory", { categoryId });
  return { success: true, message: "Category deleted successfully" };
}

export async function getRecentUser(_accessToken?: string, params: FetchRecentUserParam = {}): Promise<RecentUser[]> {
  await mockRequest("admin.recentUsers");
  const { page = 1, size = 10 } = params;
  const result = offsetPage(mockAdminUsers, page, size);
  const offset = (result.page - 1) * result.size;
  return result.content.map((u, i) => ({
    // RecentUser.userId is typed as a number; use the row position.
    userId: offset + i + 1,
    fullName: u.fullName,
    gender: u.gender,
    email: u.email,
    role: u.role as Role,
    totalCount: result.totalElements,
  }));
}

// ── Transactions & withdrawals ───────────────────────────────

export async function getAllTransactions(
  params: FetchTransactionsParams = {},
): Promise<PaginatedData<TransactionResponse>> {
  await mockRequest("admin.transactions");
  const { search = "", sort = "", page = 1, size = 10 } = params;
  const q = search.trim().toLowerCase();
  const filtered = mockAdminPayments.filter(
    (p) => !q || [p.fullName, p.organizer, p.event].some((v) => v.toLowerCase().includes(q)),
  );
  const sorted = [...filtered].sort((a, b) =>
    sort === "Oldest" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date),
  );
  return withTotalCount(offsetPage(sorted, page, size));
}

export async function getWithdrawals(params: FetchWithdrawalsParams = {}): Promise<WithdrawalResponse[]> {
  await mockRequest("admin.withdrawals");
  const { status = "Pending", sort = "Newest", page = 1, size = 10 } = params;
  const filtered = mockAdminWithdrawals
    .filter((w) => w.status === status)
    .sort((a, b) =>
      sort === "Oldest" ? a.requestDate.localeCompare(b.requestDate) : b.requestDate.localeCompare(a.requestDate),
    );
  const result = offsetPage(filtered, page, size);
  return result.content.map((w) => toWithdrawalResponse(w, result.totalElements));
}

export async function getWithdrawalKpi(): Promise<WithdrawalKpi | null> {
  await mockRequest("admin.withdrawals.kpi");
  return {
    totalRequests: mockAdminWithdrawals.length,
    approved: mockAdminWithdrawals.filter((w) => w.status === "Approved").length,
    pending: mockAdminWithdrawals.filter((w) => w.status === "Pending").length,
    rejected: mockAdminWithdrawals.filter((w) => w.status === "Rejected").length,
  };
}

export async function updateWithdrawalStatus(
  withdrawalId: string,
  status: "Approved" | "Rejected",
  transactionRef?: string,
  proof?: File,
): Promise<void> {
  await mockRequest("admin.withdrawals.update");
  const withdrawal = mockAdminWithdrawals.find((w) => w.withdrawalId === withdrawalId);
  if (!withdrawal) throw notFound("Withdrawal");
  withdrawal.status = status;
  withdrawal.transactionRef = transactionRef ?? withdrawal.transactionRef ?? null;
  // Mirror the decision onto the organizer's wallet ledger.
  if (withdrawal.ledgerTx) withdrawal.ledgerTx.status = status;
  logMockWrite("updateWithdrawalStatus", {
    withdrawalId,
    status,
    proof: proof ? `"${proof.name}" was not stored (no media storage in mock mode)` : undefined,
  });
}

// ── Reports ──────────────────────────────────────────────────

function toReportResponse(r: MockReportRecord): ReportResponse {
  return {
    reportId: r.reportId,
    reason: r.reason,
    reporter: reporterName(r),
    type: r.type,
    createdAt: r.createdAt,
    status: r.status,
  };
}

export async function getReports(params: FetchReportsParams = {}): Promise<PaginatedData<ReportResponse>> {
  await mockRequest("admin.reports");
  const { type, status, sort = "Newest", page = 1, size = 10 } = params;
  const filtered = mockContentReports.filter((r) => (!type || r.type === type) && (!status || r.status === status));
  return offsetPage(sortByDate(filtered, sort).map(toReportResponse), page, size);
}

export const getReportsServer = getReports;

export async function updateReportStatus(reportId: string, status: "Approved" | "Rejected"): Promise<void> {
  await mockRequest("admin.reports.update");
  const report = findMockReport(reportId);
  if (!report) throw notFound("Report");
  report.status = status;
  logMockWrite("updateReportStatus", { reportId, status });
}

export async function getReportSummary(reportId: string): Promise<AdminReportSummary> {
  await mockRequest("admin.reports.summary");
  const report = findMockReport(reportId);
  if (!report) throw notFound("Report");
  const totalReport = reportsForTarget(report.targetId).length;

  if (report.type === "Event") {
    const event = findMockEvent(report.targetId);
    if (!event) throw notFound("Event");
    return {
      reportId,
      targetId: event.eventId,
      type: "Event",
      title: event.title,
      status: report.status,
      media: [{ url: event.cover, type: "Image" }],
      startAt: event.startAt,
      location: { ...event.address },
      joined: event.attendeeCount,
      capacity: event.capacity ?? 0,
      category: event.categoryName,
      totalReport,
    };
  }

  const activity = findMockActivity(report.targetId);
  if (!activity) throw notFound("Activity");
  return {
    reportId,
    targetId: activity.activityId,
    type: "Activity",
    title: activity.content,
    status: report.status,
    media: activity.media.map((m) => ({ url: m.fileUrl, type: m.type })),
    startAt: activity.createdAt,
    location: null,
    joined: 0,
    capacity: 0,
    category: "",
    totalReport,
  };
}

export const getReportSummaryServer = getReportSummary;

export async function getReportContent(reportId: string): Promise<AdminReportDetail> {
  await mockRequest("admin.reports.content");
  const report = findMockReport(reportId);
  if (!report) throw notFound("Report");

  if (report.type === "Event") {
    const event = findMockEvent(report.targetId);
    if (!event) throw notFound("Event");
    return {
      title: event.title,
      description: event.description,
      status: event.status,
      postBy: contentAuthorName(event.orgId, event.userId),
      province: event.province,
      startAt: event.startAt,
      endAt: event.endAt,
      capacity: event.capacity ?? 0,
      price: event.price,
      agenda: structuredClone(event.agenda),
    };
  }

  const activity = findMockActivity(report.targetId);
  if (!activity) throw notFound("Activity");
  return {
    title: activity.content,
    description: activity.content,
    status: activity.isPublished ? "Approved" : "Pending",
    postBy: contentAuthorName(activity.orgId, activity.userId),
    province: activity.province,
    startAt: activity.createdAt,
    endAt: activity.createdAt,
    capacity: 0,
    price: 0,
    agenda: {},
  };
}

export const getReportContentServer = getReportContent;

export async function getRelatedReports(
  reportId: string,
  params: FetchRelatedReportsParams = {},
): Promise<PaginatedData<AdminReportItem>> {
  await mockRequest("admin.reports.related");
  const report = findMockReport(reportId);
  if (!report) throw notFound("Report");
  const { publishType, sort = "Newest", page = 1, size = 10 } = params;
  const related = reportsForTarget(report.targetId).filter((r) => !publishType || r.type === publishType);
  return offsetPage(
    sortByDate(related, sort).map(
      (r): AdminReportItem => ({
        reportId: r.reportId,
        reporterBy: reporterName(r),
        reason: r.reason,
        description: r.description,
        reportedOn: r.createdAt,
        status: r.status,
      }),
    ),
    page,
    size,
  );
}

export const getRelatedReportsServer = getRelatedReports;

export async function getActivityReportDetail(activityId: string): Promise<ActivityReportDetail> {
  await mockRequest("admin.reports.activity");
  const activity = findMockActivity(activityId);
  if (!activity) throw notFound("Activity");
  const reports = sortByDate(reportsForTarget(activityId));
  const author = findMockOrganization(activity.orgId) ?? findMockAccount(activity.userId);
  const status = reports.some((r) => r.status === "Approved")
    ? "Approved"
    : reports.some((r) => r.status === "Pending")
      ? "Pending"
      : "Rejected";

  return {
    activityId: activity.activityId,
    content: activity.content,
    isPublished: activity.isPublished,
    province: activity.province,
    status,
    totalReports: reports.length,
    userId: activity.userId ?? "",
    orgId: activity.orgId ?? "",
    postBy: contentAuthorName(activity.orgId, activity.userId),
    avatar: (author && ("logo" in author ? author.logo : author.avatar)) || MOCK_AVATARS.fallback,
    createdAt: activity.createdAt,
    tags: activity.tags.map((t) => t.name),
    media: activity.media.map((m) => ({ mediaId: m.actMediaId, type: m.type, url: m.fileUrl })),
    reports: offsetPage(
      reports.map(
        (r): ActivityReportItem => ({
          reportId: r.reportId,
          reporterBy: reporterName(r),
          reason: r.reason,
          details: r.description,
          reportedOn: r.createdAt,
          status: r.status,
        }),
      ),
      1,
      10,
    ),
  };
}

export const getActivityReportDetailServer = getActivityReportDetail;

export async function getActivityFullReportDetail(reportId: string): Promise<ActivityReportDetail> {
  const summary = await getReportSummary(reportId);
  const activity = await getActivityReportDetail(summary.targetId);
  return { ...activity, status: summary.status };
}

export const getActivityFullReportDetailServer = getActivityFullReportDetail;

export async function getEventReportDetail(reportId: string): Promise<EventReportDetail | null> {
  const [summary, content, related] = await Promise.all([
    getReportSummary(reportId),
    getReportContent(reportId),
    getRelatedReports(reportId, { publishType: "Event", size: 100 }),
  ]);
  return assembleEventDetail(summary, content, related);
}

export const getEventReportDetailServer = getEventReportDetail;

// ── Users ────────────────────────────────────────────────────

function findAdminUser(userId: string) {
  const user = mockAdminUsers.find((u) => u.userId === userId);
  if (!user) throw notFound("User");
  return user;
}

export async function getAllUsers(params: FetchUsersParams = {}): Promise<PaginatedData<AdminUser>> {
  await mockRequest("admin.users");
  const { status, page = 1, size = 10 } = params;
  const filtered = mockAdminUsers.filter((u) => !status || u.status === status);
  return offsetPage(
    filtered.map(
      (u): AdminUser => ({
        userId: u.userId,
        fullName: u.fullName,
        gender: u.gender,
        email: u.email,
        organization: u.organization,
        status: u.status,
        biography: u.biography,
        profile: u.profile,
      }),
    ),
    page,
    size,
  );
}

export async function createUser(body: CreateUserBody): Promise<void> {
  await mockRequest("admin.users.create");
  if (mockAdminUsers.some((u) => u.email.toLowerCase() === body.email.toLowerCase())) {
    throw apiErrorResponse(409, "Email is already in use");
  }
  const userId = nextMockId("1");
  mockAdminUsers.unshift({
    userId,
    fullName: body.fullName,
    gender: body.gender,
    email: body.email,
    organization: "",
    status: body.verified ? "Active" : "Inactive",
    biography: "",
    profile: MOCK_AVATARS.fallback,
    role: "User",
    createdAt: new Date().toISOString(),
  });
  // The password is intentionally discarded; created users cannot sign in.
  logMockWrite("createUser", { userId, email: body.email });
}

export async function updateUser(userId: string, body: UpdateUserBody): Promise<void> {
  await mockRequest("admin.users.update");
  const user = findAdminUser(userId);
  if (body.fullName !== undefined) user.fullName = body.fullName;
  if (body.email !== undefined) user.email = body.email;
  if (body.gender !== undefined) user.gender = body.gender;
  if (body.verified !== undefined) user.status = body.verified ? "Active" : "Inactive";
  logMockWrite("updateUser", { userId });
}

export async function deleteUser(userId: string): Promise<void> {
  await mockRequest("admin.users.delete");
  const index = mockAdminUsers.findIndex((u) => u.userId === userId);
  if (index === -1) throw notFound("User");
  mockAdminUsers.splice(index, 1);
  logMockWrite("deleteUser", { userId });
}

export async function getUserById(userId: string): Promise<UserDetail> {
  await mockRequest("admin.users.detail");
  const user = findAdminUser(userId);
  return {
    userId: user.userId,
    fullName: user.fullName,
    role: user.role,
    gender: user.gender,
    email: user.email,
    biography: user.biography,
    status: user.status,
    profile: user.profile,
  };
}

// ── Organizers ───────────────────────────────────────────────

function toOrganizerDetail(orgId: string): OrganizerDetail {
  const request = findMockOrgRequest(orgId);
  if (!request) throw notFound("Organizer");
  return {
    orgId: request.orgId,
    orgName: request.orgName,
    owner: request.requestBy,
    role: "Organizer",
    province: request.province,
    phone: request.phone,
    email: request.email,
    website: request.website,
    bio: request.about,
    status: request.status,
  };
}

export async function getAllOrganizers(params: FetchOrganizersParams = {}): Promise<PaginatedData<AdminOrganizer>> {
  await mockRequest("admin.organizers");
  const { status, search, page = 1, size = 10 } = params;
  const q = search?.trim().toLowerCase() ?? "";
  const filtered = mockOrgRequests.filter(
    (r) =>
      (!status || r.status === status) &&
      (!q || r.orgName.toLowerCase().includes(q) || r.requestBy.toLowerCase().includes(q)),
  );
  return offsetPage(
    sortByDate(filtered.map((r) => ({ ...r, createdAt: r.submitted }))).map(
      (r): AdminOrganizer => ({ ...toOrganizerDetail(r.orgId), submitted: r.submitted }),
    ),
    page,
    size,
  );
}

export async function getOrganizerById(orgId: string): Promise<OrganizerDetail> {
  await mockRequest("admin.organizers.detail");
  return toOrganizerDetail(orgId);
}

export async function deleteOrganizer(orgId: string): Promise<void> {
  await mockRequest("admin.organizers.delete");
  const index = mockOrgRequests.findIndex((r) => r.orgId === orgId);
  if (index === -1) throw notFound("Organizer");
  // Removed from admin listings only; the organization's events and profile stay.
  mockOrgRequests.splice(index, 1);
  logMockWrite("deleteOrganizer", { orgId });
}

export async function updateOrganizer(orgId: string, body: UpdateOrganizerBody): Promise<void> {
  await mockRequest("admin.organizers.update");
  const request = findMockOrgRequest(orgId);
  if (!request) throw notFound("Organizer");
  if (body.orgName !== undefined) request.orgName = body.orgName;
  if (body.email !== undefined) request.email = body.email;
  if (body.phone !== undefined) request.phone = body.phone;
  if (body.province !== undefined) request.province = body.province;
  if (body.website !== undefined) request.website = body.website;
  if (body.about !== undefined) request.about = body.about;

  const profile = findMockOrganizationProfile(orgId);
  if (profile) {
    if (body.orgName !== undefined) profile.name = body.orgName;
    if (body.phone !== undefined) profile.phone = body.phone;
    if (body.province !== undefined) profile.province = body.province;
    if (body.website !== undefined) profile.website = body.website;
    if (body.about !== undefined) profile.about = body.about;
  }
  logMockWrite("updateOrganizer", { orgId });
}

// ── Moderators ───────────────────────────────────────────────

function findModerator(userId: string) {
  const moderator = mockModerators.find((m) => m.userId === userId);
  if (!moderator) throw notFound("Moderator");
  return moderator;
}

export async function getAllModerators(params: FetchModeratorsParams = {}): Promise<PaginatedData<AdminModerator>> {
  await mockRequest("admin.moderators");
  const { gender, search, page = 1, size = 10 } = params;
  const q = search?.trim().toLowerCase() ?? "";
  const filtered = mockModerators.filter(
    (m) =>
      (!gender || m.gender === gender) &&
      (!q || m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)),
  );
  return offsetPage(
    filtered.map(
      (m): AdminModerator => ({
        userId: m.userId,
        fullName: m.fullName,
        gender: m.gender,
        email: m.email,
        province: m.province,
      }),
    ),
    page,
    size,
  );
}

export async function createModerator(body: CreateModeratorBody): Promise<void> {
  await mockRequest("admin.moderators.create");
  if (mockModerators.some((m) => m.email.toLowerCase() === body.email.toLowerCase())) {
    throw apiErrorResponse(409, "Email is already in use");
  }
  const userId = nextMockId("1");
  mockModerators.push({
    userId,
    fullName: body.fullName,
    gender: body.gender,
    email: body.email,
    province: body.province,
    bio: "",
    photo: MOCK_AVATARS.profile,
    isVerified: false,
  });
  // The password is intentionally discarded; created moderators cannot sign in.
  logMockWrite("createModerator", { userId, email: body.email });
}

export async function updateModerator(userId: string, body: UpdateModeratorBody): Promise<void> {
  await mockRequest("admin.moderators.update");
  const moderator = findModerator(userId);
  if (body.fullName !== undefined) moderator.fullName = body.fullName;
  if (body.gender !== undefined) moderator.gender = body.gender;
  if (body.email !== undefined) moderator.email = body.email;
  if (body.province !== undefined) moderator.province = body.province;
  logMockWrite("updateModerator", { userId });
}

export async function deleteModerator(userId: string): Promise<void> {
  await mockRequest("admin.moderators.delete");
  const index = mockModerators.findIndex((m) => m.userId === userId);
  if (index === -1) throw notFound("Moderator");
  mockModerators.splice(index, 1);
  logMockWrite("deleteModerator", { userId });
}

export async function getModeratorById(userId: string): Promise<ModeratorDetail> {
  await mockRequest("admin.moderators.detail");
  const m = findModerator(userId);
  return {
    userId: m.userId,
    fullName: m.fullName,
    role: "Moderator",
    gender: m.gender,
    province: m.province,
    photo: m.photo,
    email: m.email,
    bio: m.bio,
    isVerified: m.isVerified,
  };
}
