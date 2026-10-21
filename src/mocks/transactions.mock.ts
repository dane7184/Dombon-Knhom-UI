// Mirrors GET /organizations/{orgId}/transactions → RecentTransaction[].
// Newest first, mixing ticket earnings with withdrawals in every status so
// the wallet table's sorting, pagination and status badges can be exercised.

import type { RecentTransaction } from "@/types/organizer.type";
import { MOCK_ORG_IDS } from "@/mocks/ids";
import { isoFromNow, mockId } from "@/mocks/utils";

/** Placeholder "transfer proof" image (a local QR graphic, not a real receipt). */
const PROOF_PLACEHOLDER = "/images/qr.png";

interface TxSeed {
  n: number;
  type: "Earn" | "Withdraw";
  status: RecentTransaction["status"];
  note: string;
  amount: number;
  daysAgo: number;
  hour: number;
}

const angkorSeeds: TxSeed[] = [
  { n: 1, type: "Earn", status: null, note: "Ticket sales — Angkor Wat Sunrise Walk", amount: 180, daysAgo: 0, hour: 10 },
  { n: 2, type: "Withdraw", status: "Pending", note: "Withdrawal to ABA ••• 4821", amount: 400, daysAgo: 1, hour: 15 },
  { n: 3, type: "Earn", status: null, note: "Ticket sales — Angkor Cultural Bonfire Night", amount: 325, daysAgo: 3, hour: 19 },
  { n: 4, type: "Earn", status: null, note: "Ticket sales — Angkor Wat Sunrise Walk", amount: 90, daysAgo: 6, hour: 8 },
  { n: 5, type: "Withdraw", status: "Approved", note: "Withdrawal to ABA ••• 4821", amount: 600, daysAgo: 9, hour: 11 },
  { n: 6, type: "Earn", status: null, note: "Ticket sales — Angkor Cultural Bonfire Night", amount: 450, daysAgo: 12, hour: 20 },
  { n: 7, type: "Withdraw", status: "Rejected", note: "Withdrawal to Wing ••• 0193 (QR expired)", amount: 250, daysAgo: 16, hour: 9 },
  { n: 8, type: "Earn", status: null, note: "Ticket sales — Siem Reap Night Art Market", amount: 210, daysAgo: 19, hour: 22 },
  { n: 9, type: "Earn", status: null, note: "Ticket sales — Siem Reap Night Art Market", amount: 165, daysAgo: 21, hour: 18 },
  { n: 10, type: "Withdraw", status: "Approved", note: "Withdrawal to ABA ••• 4821", amount: 1000, daysAgo: 35, hour: 14 },
  { n: 11, type: "Earn", status: null, note: "Ticket sales — Royal Ballet Evening Performance", amount: 540, daysAgo: 76, hour: 21 },
  { n: 12, type: "Earn", status: null, note: "Ticket sales — Royal Ballet Evening Performance", amount: 342, daysAgo: 78, hour: 12 },
  { n: 13, type: "Withdraw", status: "Approved", note: "Withdrawal to ABA ••• 4821", amount: 1500, daysAgo: 95, hour: 10 },
  { n: 14, type: "Earn", status: null, note: "Ticket sales — Khmer New Year Street Celebration", amount: 1240, daysAgo: 190, hour: 16 },
];

function buildLedger(seeds: TxSeed[], openingBalance: number): RecentTransaction[] {
  // Running balance is computed oldest → newest, then returned newest first.
  let balance = openingBalance;
  const oldestFirst = [...seeds].sort((a, b) => b.daysAgo - a.daysAgo || a.hour - b.hour);
  const ledger = oldestFirst.map((s): RecentTransaction => {
    const affectsBalance = s.type === "Earn" || s.status !== "Rejected";
    if (affectsBalance) balance += s.type === "Earn" ? s.amount : -s.amount;
    return {
      id: mockId("7", s.n),
      type: s.type,
      status: s.status,
      note: s.note,
      amount: s.amount,
      balanceAfter: s.type === "Earn" || s.status === "Approved" ? balance : null,
      proofUrl: s.type === "Withdraw" && s.status === "Approved" ? PROOF_PLACEHOLDER : null,
      createdAt: isoFromNow(-s.daysAgo, s.hour),
    };
  });
  return ledger.reverse();
}

const OPENING_BALANCES: Record<string, number> = {
  [MOCK_ORG_IDS.angkor]: 3420,
  [MOCK_ORG_IDS.mekong]: 0,
  [MOCK_ORG_IDS.techHub]: 0,
};

/** Mutable per-organization ledgers (newest first). */
export const mockTransactions: Record<string, RecentTransaction[]> = {
  [MOCK_ORG_IDS.angkor]: buildLedger(angkorSeeds, OPENING_BALANCES[MOCK_ORG_IDS.angkor]),
  [MOCK_ORG_IDS.mekong]: [],
  [MOCK_ORG_IDS.techHub]: [],
};

/**
 * Wallet balance = opening balance + earnings − withdrawals that were not
 * rejected (pending withdrawals are held, so they are already deducted).
 */
export function walletBalance(orgId: string): number {
  return (mockTransactions[orgId] ?? []).reduce((balance, tx) => {
    if (tx.type === "Earn") return balance + tx.amount;
    return tx.status === "Rejected" ? balance : balance - tx.amount;
  }, OPENING_BALANCES[orgId] ?? 0);
}
