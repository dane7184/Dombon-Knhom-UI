"use server";

import {
  currentBalance,
  EventManagement,
  EventManagementPage,
  EventManagementDetails,
  OrganizerKpi,
  RecentTransaction,
  TotalEarningsPerMonth,
  TotalLikeAndAttendee,
} from "@/types/organizer.type";
import { auth } from "@/lib/auth";
import {
  CurrentBalanceService,
  getEventManagementPage,
  getEventUpcoming,
  getOrganizerKpi,
  getTop5Event,
  getTotalLikeAndAttendee,
  orgChangeAvatarService,
  recentTransactionService,
  submitWithdrawalService,
  TotalEarningService,
} from "@/services/organizer.service";

//                                     Tab Overview
// Get KPI Card
export async function getOrganizerKpiAction(): Promise<{
  success: boolean;
  data: OrganizerKpi | null;
  error?: string;
}> {
  try {
    const session = await auth();
    const orgId = session?.user?.orgId;
    const orgToken = session?.user?.accessToken;

    if (!orgId || !orgToken) {
      return {
        success: false,
        data: null,
        error: "Organization information not found",
      };
    }

    const result = await getOrganizerKpi(orgId, orgToken);
    return { success: true, data: result };
  } catch (err) {
    console.error("[getOrganizerKpiAction] failed:", err);
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch KPI",
    };
  }
}

function buildLast12Months(
    apiData: TotalLikeAndAttendee[],
): TotalLikeAndAttendee[] {
  const safe = Array.isArray(apiData) ? apiData : [];
  const now = new Date();
  const year = now.getFullYear();
  const result: TotalLikeAndAttendee[] = [];

  for (let month = 0; month <= 11; month++) {
    const date = new Date(year, month, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const existing = safe.find((item) => item.month === monthKey);

    result.push({
      month: monthKey,
      totalLikes: existing?.totalLikes ?? 0,
      totalAttendees: existing?.totalAttendees ?? 0,
    });
  }

  return result;
}

// get total like and attendee
export async function getTotalLikeAndAttendeeAction(): Promise<{
  success: boolean;
  data: TotalLikeAndAttendee[];
  error?: string;
}> {
  try {
    const session = await auth();
    const orgId = session?.user?.orgId;
    const orgToken = session?.user?.accessToken;

    if (!orgId || !orgToken) {
      return {
        success: false,
        data: buildLast12Months([]),
        error: "Organization not found",
      };
    }

    const total = await getTotalLikeAndAttendee(orgId, orgToken);
    return { success: true, data: buildLast12Months(total) };
  } catch (err) {
    console.error("[getTotalLikeAndAttendeeAction] failed:", err);
    return {
      success: false,
      data: buildLast12Months([]),
      error: err instanceof Error ? err.message : "Failed to fetch",
    };
  }
}

// Get Event upcoming
export async function getEventUpcomingAction(): Promise<{
  success: boolean;
  data: EventManagement[];
  error?: string;
}> {
  try {
    const session = await auth();
    const orgId = session?.user?.orgId;
    const orgToken = session?.user?.accessToken;
    if (!orgId || !orgToken)
      return {
        success: false,
        data: [],
        error: "Organization not found",
      };

    const data = await getEventUpcoming(orgId, orgToken);
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    return {
      success: false,
      data: [],
      error: err instanceof Error ? err.message : "Failed",
    };
  }
}

// get top 5 event
export async function getTop5EventAction(): Promise<{
  success: boolean;
  data: EventManagementDetails[];
  error?: string;
}> {
  try {
    const session = await auth();
    const orgId = session?.user?.orgId;
    const orgToken = session?.user?.accessToken;

    if (!orgId || !orgToken)
      return {
        success: false,
        data: [],
        error: "Organization not found",
      };

    const data = await getTop5Event(orgId, orgToken);
    return { success: true, data: Array.isArray(data) ? data.slice(0, 5) : [] };
  } catch (err) {
    return {
      success: false,
      data: [],
      error: err instanceof Error ? err.message : "Failed",
    };
  }
}

//                                            Tab Event Management
// get event management
export async function getEventManagementAction(): Promise<{
  success: boolean;
  data: EventManagementPage;
  error?: string;
}> {
  const emptyPage: EventManagementPage = {
    events: [],
    nextCursor: null,
    hasNext: false,
  };

  try {
    const session = await auth();
    const orgId = session?.user?.orgId;

    if (!orgId) {
      return { success: false, data: emptyPage, error: "Organization not found" };
    }

    const page = await getEventManagementPage(orgId);
    return { success: true, data: page };
  } catch (err) {
    console.error("[getEventManagementAction] failed:", err);
    return {
      success: false,
      data: emptyPage,
      error: err instanceof Error ? err.message : "Failed to fetch events",
    };
  }
}

//                                      Wallet
// Total Earning
function buildLast12MonthsEarning(
  apiData: TotalEarningsPerMonth[],
): TotalEarningsPerMonth[] {
  const safe = Array.isArray(apiData) ? apiData : [];
  const now = new Date();
  const year = now.getFullYear();
  const result: TotalEarningsPerMonth[] = [];

  for (let month = 0; month <= 11; month++) {
    const date = new Date(year, month, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const existing = safe.find((item) => item.month === monthKey);

    result.push({
      month: monthKey,
      totalEarning: existing?.totalEarning ?? 0,
    });
  }

  return result;
}

export async function getTotalEarning(): Promise<{
  success: boolean;
  data: TotalEarningsPerMonth[];
  error?: string;
}> {
  try {
    const session = await auth();
    const orgId = session?.user?.orgId;
    const orgToken = session?.user?.accessToken;

    if (!orgId || !orgToken) {
      return { success: false, data: [], error: "Organization not found" };
    }

    const raw = await TotalEarningService(orgId, orgToken);
    const chartData = buildLast12MonthsEarning(raw);

    return { success: true, data: chartData };
  } catch (err) {
    console.error("[getTotalEarning] failed:", err);
    return {
      success: false,
      data: [],
      error:
        err instanceof Error ? err.message : "Failed to fetch total earnings",
    };
  }
}

//      Current Balance
export async function getCurrentBalanceAction(): Promise<{
  success: boolean;
  data: currentBalance | null;
  error?: string;
}> {
  try {
    const session = await auth();
    const orgToken = session?.user?.accessToken;

    if (!orgToken) {
      return { success: false, data: null, error: "Could not get user token" };
    }

    const data = await CurrentBalanceService(orgToken);
    return { success: true, data };
  } catch (err) {
    console.error("[getCurrentBalanceAction] failed:", err);
    return {
      success: false,
      data: null,
      error:
        err instanceof Error ? err.message : "Failed to fetch current balance",
    };
  }
}

export async function getRecentTransactionAction(): Promise<{
  success: boolean;
  data: RecentTransaction[];
  error?: string;
}> {
  try {
    const session = await auth();
    const orgId = session?.user?.orgId;
    const orgToken = session?.user?.accessToken;

    if (!orgId || !orgToken) {
      return {
        success: false,
        data: [],
        error: "Organization information not found",
      };
    }

    const data = await recentTransactionService(orgId, orgToken);
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    console.error("[getRecentTransactionAction] failed:", err);
    return {
      success: false,
      data: [],
      error:
        err instanceof Error ? err.message : "Failed to fetch transactions",
    };
  }
}

export async function submitWithdrawalAction(input: {
  amount: number;
  qrString: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    const orgToken = session?.user?.accessToken;

    if (!orgToken) {
      return { success: false, error: "Organization information not found" };
    }

    const wallet = await CurrentBalanceService(orgToken);
    await submitWithdrawalService(orgToken, {
      walletId: wallet.walletId,
      amount: input.amount,
      qrString: input.qrString,
    });

    return { success: true };
  } catch (err) {
    console.error("[submitWithdrawalAction] failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit withdrawal request",
    };
  }
}

export async function changeOrgAvatarAction(formData: FormData): Promise<{
  success: boolean;
  data: { logoUrl?: string; avatar?: string } | null;
  error?: string;
}> {
  try {
    const session = await auth();
    const orgId = session?.user?.orgId;
    const orgToken = session?.user?.accessToken;

    if (!orgId || !orgToken) {
      return {
        success: false,
        data: null,
        error: "Organization information not found",
      };
    }

    const file = formData.get("logo") as File | null;
    if (!file || file.size === 0) {
      return { success: false, data: null, error: "No file provided" };
    }

    const data = await orgChangeAvatarService(orgId, orgToken, file);
    return { success: true, data };
  } catch (err) {
    console.error("[changeOrgAvatarAction] failed:", err);
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : "Failed to update logo",
    };
  }
}
