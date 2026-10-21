// Mock implementation of services/api/organizer.service.ts.
// Same exported names and compatible signatures (unused trailing parameters
// such as tokens are omitted); data comes from src/mocks.

import type {
  currentBalance,
  EventManagement,
  EventManagementDetails,
  EventManagementPage,
  organizationInfo,
  OrganizerKpi,
  RecentTransaction,
  TotalEarningsPerMonth,
  TotalLikeAndAttendee,
  UpdateOrganizationRequest,
} from "@/types/organizer.type";
import { mockMonthlyEarnings, totalEarned } from "@/mocks/earnings.mock";
import { eventsOfOrganization, toEventManagement, toEventManagementDetails } from "@/mocks/events.mock";
import {
  findMockOrganizationProfile,
  MOCK_WALLET_CURRENCY,
  mockOrganizerStats,
  mockWalletIds,
  organizationFavoriteCount,
} from "@/mocks/organizer.mock";
import { mockTransactions, walletBalance } from "@/mocks/transactions.mock";
import { readMockToken } from "@/mocks/auth.mock";
import { clone, cursorPage, logMockWrite, mockRequest, nextMockId } from "@/mocks/utils";

/** Page size for organizer event pages (the real endpoint has no size param). */
const EVENT_PAGE_SIZE = 6;

function requireOrg(orgId: string) {
  if (!orgId) throw new Error("Organization ID is required");
  const org = findMockOrganizationProfile(orgId);
  if (!org) throw new Error("Organization info could not be found");
  return org;
}

function orgIdFromToken(orgToken: string): string {
  const orgId = readMockToken(orgToken)?.orgId;
  if (!orgId) throw new Error("Organization information not found");
  return orgId;
}

export async function getOrganizerKpi(orgId: string): Promise<OrganizerKpi> {
  await mockRequest("organizer.kpi");
  const org = requireOrg(orgId);
  const events = eventsOfOrganization(orgId);
  const rated = events.filter((e) => e.ratingCount > 0);
  const averageRating = rated.length
    ? rated.reduce((sum, e) => sum + e.averageRating, 0) / rated.length
    : 0;

  return {
    totalEvents: events.length,
    totalFavorites: organizationFavoriteCount(org),
    totalMoneyEarned: totalEarned(orgId),
    totalRatings: Math.round(averageRating * 10) / 10,
  };
}

export async function getEventManagement(orgId: string): Promise<EventManagement[]> {
  await mockRequest("organizer.events");
  requireOrg(orgId);
  return eventsOfOrganization(orgId).map(toEventManagement);
}

export async function getEventManagementPage(
  orgId: string,
  cursor: string | null = null,
): Promise<EventManagementPage> {
  await mockRequest("organizer.events");
  requireOrg(orgId);
  const page = cursorPage(eventsOfOrganization(orgId).map(toEventManagement), cursor, EVENT_PAGE_SIZE);
  return { events: page.content, nextCursor: page.nextCursor, hasNext: page.hasNext };
}

export async function getEventUpcoming(orgId: string): Promise<EventManagement[]> {
  const events = await getEventManagement(orgId);
  return events.filter((e) => new Date(e.startAt).getTime() > Date.now());
}

export async function getTotalLikeAndAttendee(orgId: string): Promise<TotalLikeAndAttendee[]> {
  await mockRequest("organizer.stats");
  requireOrg(orgId);
  return clone(mockOrganizerStats);
}

export async function getTop5Event(orgId: string): Promise<EventManagementDetails[]> {
  await mockRequest("organizer.top5");
  requireOrg(orgId);
  return eventsOfOrganization(orgId)
    .filter((e) => e.status === "Approved")
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 5)
    .map(toEventManagementDetails);
}

export async function organizationInfoService(orgId: string): Promise<organizationInfo> {
  await mockRequest("organizer.info");
  const org = requireOrg(orgId);
  return {
    name: org.name,
    logo: org.logo,
    about: org.about,
    phone: org.phone,
    website: org.website,
    province: org.province,
  };
}

export async function updateOrganizationService(
  orgId: string,
  _orgToken: string,
  payload: UpdateOrganizationRequest,
): Promise<UpdateOrganizationRequest> {
  await mockRequest("organizer.update");
  const org = requireOrg(orgId);
  org.name = payload.name;
  org.about = payload.about;
  org.phone = payload.phone;
  org.website = payload.website;
  logMockWrite("updateOrganization", { orgId });
  return { ...payload };
}

export async function deleteAccountOrganizer(orgId: string): Promise<void> {
  await mockRequest("organizer.delete");
  requireOrg(orgId);
  // Nothing is removed so the mock stays usable; the caller still signs out.
  logMockWrite("deleteOrganization (not applied — fixtures kept)", { orgId });
}

export async function recentTransactionService(
  orgId: string,
  _orgToken: string,
  page = 1,
  size = 10,
): Promise<RecentTransaction[]> {
  await mockRequest("organizer.transactions");
  requireOrg(orgId);
  const ledger = mockTransactions[orgId] ?? [];
  const start = (Math.max(1, page) - 1) * size;
  return clone(ledger.slice(start, start + size));
}

export async function TotalEarningService(orgId: string): Promise<TotalEarningsPerMonth[]> {
  await mockRequest("organizer.earnings");
  requireOrg(orgId);
  return clone(mockMonthlyEarnings[orgId] ?? []);
}

export async function CurrentBalanceService(orgToken: string): Promise<currentBalance> {
  await mockRequest("organizer.wallet");
  const orgId = orgIdFromToken(orgToken);
  return {
    balance: walletBalance(orgId),
    currency: MOCK_WALLET_CURRENCY,
    walletId: mockWalletIds[orgId],
  };
}

export async function submitWithdrawalService(
  orgToken: string,
  body: { walletId: string; amount: number; qrString: string },
): Promise<void> {
  await mockRequest("organizer.withdraw");
  const orgId = orgIdFromToken(orgToken);
  if (body.walletId !== mockWalletIds[orgId]) throw new Error("Wallet not found");
  if (!(body.amount > 0)) throw new Error("Amount must be greater than 0");
  if (body.amount > walletBalance(orgId)) throw new Error("Insufficient balance");

  const ledger = (mockTransactions[orgId] ??= []);
  ledger.unshift({
    id: nextMockId("7"),
    type: "Withdraw",
    status: "Pending",
    note: "Withdrawal request (mock)",
    amount: body.amount,
    balanceAfter: null,
    proofUrl: null,
    createdAt: new Date().toISOString(),
  });
  logMockWrite("submitWithdrawal", { orgId, amount: body.amount });
}

export async function orgChangeAvatarService(): Promise<{ logoUrl?: string; avatar?: string }> {
  await mockRequest("organizer.logo");
  throw new Error("Uploading a logo is not available in mock mode (no media storage).");
}
