// Mirrors GET /admin/withdrawals → WithdrawalResponse[].
// Withdrawals of the shared mock organizations are derived from their wallet
// ledgers (transactions.mock.ts), so approving/rejecting one here also updates
// the organizer's wallet. The remaining rows reuse src/data/mock-withdrawals.ts.

import type { WithdrawalResponse } from "@/types/admin.type";
import type { RecentTransaction } from "@/types/organizer.type";
import { mockWithdrawals as legacyWithdrawals } from "@/data/mock-withdrawals";
import { findMockOrganization } from "@/mocks/auth.mock";
import { mockTransactions } from "@/mocks/transactions.mock";
import { mockId } from "@/mocks/utils";

export interface MockWithdrawalRecord extends Omit<WithdrawalResponse, "totalCount"> {
  /** Ledger entry this withdrawal mirrors, when it belongs to a mock organization. */
  ledgerTx: RecentTransaction | null;
}

function placeholderQr(withdrawalId: string): string {
  // Not a valid KHQR payload — only used so the admin UI has something to render.
  return `MOCK-KHQR-${withdrawalId}`;
}

const fromLedgers: MockWithdrawalRecord[] = Object.entries(mockTransactions).flatMap(([orgId, ledger]) =>
  ledger
    .filter((tx) => tx.type === "Withdraw")
    .map((tx): MockWithdrawalRecord => ({
      withdrawalId: tx.id,
      orgName: findMockOrganization(orgId)?.name ?? "",
      amount: tx.amount,
      requestDate: tx.createdAt,
      status: tx.status ?? "Pending",
      qrString: placeholderQr(tx.id),
      transactionRef: tx.status === "Approved" ? `ABA-${tx.id.slice(-6).toUpperCase()}` : null,
      proofUrl: tx.proofUrl,
      ledgerTx: tx,
    })),
);

const fromLegacy: MockWithdrawalRecord[] = legacyWithdrawals.map((w, i) => {
  const withdrawalId = mockId("d", 0x100 + i + 1);
  const date = new Date(w.requestDate);
  return {
    withdrawalId,
    orgName: w.orgName,
    amount: w.amount,
    requestDate: Number.isNaN(date.getTime()) ? w.requestDate : date.toISOString(),
    status: w.status,
    qrString: placeholderQr(withdrawalId),
    transactionRef: w.status === "Approved" ? `ABA-${String(i + 1).padStart(6, "0")}` : null,
    proofUrl: null,
    ledgerTx: null,
  };
});

/** Mutable in-memory store. */
export const mockAdminWithdrawals: MockWithdrawalRecord[] = [...fromLedgers, ...fromLegacy];

export function toWithdrawalResponse(w: MockWithdrawalRecord, totalCount: number): WithdrawalResponse {
  return {
    withdrawalId: w.withdrawalId,
    orgName: w.orgName,
    amount: w.amount,
    requestDate: w.requestDate,
    status: w.status,
    qrString: w.qrString,
    transactionRef: w.transactionRef,
    proofUrl: w.proofUrl,
    totalCount,
  };
}
