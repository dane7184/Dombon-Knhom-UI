// Mirrors GET /organizations/{orgId}/monthly-earning → TotalEarningsPerMonth[].
// Covers the last 12 months including the current month, oldest first.

import type { TotalEarningsPerMonth } from "@/types/organizer.type";
import { MOCK_ORG_IDS } from "@/mocks/ids";
import { monthKey } from "@/mocks/utils";

function lastTwelveMonths(amounts: readonly number[]): TotalEarningsPerMonth[] {
  return amounts.map((totalEarning, i) => ({ month: monthKey(i - 11), totalEarning }));
}

export const mockMonthlyEarnings: Record<string, TotalEarningsPerMonth[]> = {
  [MOCK_ORG_IDS.angkor]: lastTwelveMonths([420, 385, 515, 1240, 690, 455, 610, 875, 540, 980, 760, 1325]),
  [MOCK_ORG_IDS.mekong]: lastTwelveMonths([120, 95, 160, 310, 205, 180, 140, 260, 300, 215, 330, 410]),
  [MOCK_ORG_IDS.techHub]: lastTwelveMonths([0, 0, 0, 150, 90, 0, 220, 180, 0, 260, 310, 540]),
};

export function totalEarned(orgId: string): number {
  return (mockMonthlyEarnings[orgId] ?? []).reduce((sum, m) => sum + m.totalEarning, 0);
}
