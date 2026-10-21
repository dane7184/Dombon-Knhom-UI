// System-admin fixtures: managed users, moderators and ticket payments.
// Users/moderators are built from the shared mock accounts so ids line up
// with the rest of the app; a few extra rows make pagination visible.

import type { AdminModerator, AdminUser, TransactionResponse } from "@/types/admin.type";
import type { Gender } from "@/types/common.type";
import { MOCK_AVATARS } from "@/mocks/assets";
import { findMockOrganization, mockAccounts } from "@/mocks/auth.mock";
import { mockEvents } from "@/mocks/events.mock";
import { MOCK_USER_IDS } from "@/mocks/ids";
import { isoFromNow, mockId } from "@/mocks/utils";

// ── Users (GET /admin/users) ─────────────────────────────────

export interface MockAdminUserRecord extends AdminUser {
  role: string;
  createdAt: string;
}

const extraUsers: Array<{ n: number; fullName: string; gender: Gender; status: "Active" | "Inactive"; daysAgo: number }> = [
  { n: 31, fullName: "Kosal Chea", gender: "Male", status: "Active", daysAgo: 3 },
  { n: 32, fullName: "Raksmey Long", gender: "Female", status: "Active", daysAgo: 5 },
  { n: 33, fullName: "Sophea Nuon", gender: "Female", status: "Inactive", daysAgo: 12 },
  { n: 34, fullName: "Vichet Hor", gender: "Male", status: "Active", daysAgo: 18 },
  { n: 35, fullName: "Davy Seng", gender: "Female", status: "Inactive", daysAgo: 26 },
  { n: 36, fullName: "Panha Ly", gender: "Male", status: "Active", daysAgo: 33 },
];

/** Mutable in-memory store, newest first. */
export const mockAdminUsers: MockAdminUserRecord[] = [
  ...mockAccounts
    .filter((a) => a.role === "User" || a.role === "Organizer")
    .map(
      (a): MockAdminUserRecord => ({
        userId: a.userId,
        fullName: a.fullName,
        gender: a.gender,
        email: a.email,
        organization: findMockOrganization(a.orgId)?.name ?? "",
        status: "Active",
        biography: a.bio,
        profile: a.avatar ?? MOCK_AVATARS.fallback,
        role: a.role,
        createdAt: a.createdAt,
      }),
    ),
  ...extraUsers.map(
    (u): MockAdminUserRecord => ({
      userId: mockId("1", u.n),
      fullName: u.fullName,
      gender: u.gender,
      email: `${u.fullName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      organization: "",
      status: u.status,
      biography: "",
      profile: MOCK_AVATARS.fallback,
      role: "User",
      createdAt: isoFromNow(-u.daysAgo, 10),
    }),
  ),
].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

// ── Moderators (GET /admin/moderators) ───────────────────────

export interface MockModeratorRecord extends AdminModerator {
  bio: string;
  photo: string;
  isVerified: boolean;
}

const moderatorAccount = mockAccounts.find((a) => a.userId === MOCK_USER_IDS.moderator)!;

/** Mutable in-memory store. */
export const mockModerators: MockModeratorRecord[] = [
  {
    userId: moderatorAccount.userId,
    fullName: moderatorAccount.fullName,
    gender: moderatorAccount.gender,
    email: moderatorAccount.email,
    province: moderatorAccount.province,
    bio: moderatorAccount.bio,
    photo: moderatorAccount.avatar ?? MOCK_AVATARS.profile,
    isVerified: true,
  },
  {
    userId: mockId("1", 41),
    fullName: "Sovann Ros",
    gender: "Male",
    email: "sovann.ros@dombonkhnom.test",
    province: "Siem_Reap",
    bio: "Reviews events in the north-west provinces.",
    photo: MOCK_AVATARS.profile,
    isVerified: true,
  },
  {
    userId: mockId("1", 42),
    fullName: "Leakena Kong",
    gender: "Female",
    email: "leakena.kong@dombonkhnom.test",
    province: "Battambang",
    bio: "Community and content moderator.",
    photo: MOCK_AVATARS.profile,
    isVerified: false,
  },
];

// ── Ticket payments (GET /admin/transactions) ────────────────

const PAYERS = [
  MOCK_USER_IDS.sokha,
  MOCK_USER_IDS.sreypov,
  MOCK_USER_IDS.chenda,
  MOCK_USER_IDS.pisey,
  MOCK_USER_IDS.bora,
] as const;

function buildPayments(): Omit<TransactionResponse, "totalCount">[] {
  const paid = mockEvents.filter((e) => e.status === "Approved" && e.price > 0);
  const payments: Omit<TransactionResponse, "totalCount">[] = [];
  let n = 0;
  paid.forEach((event, eventIndex) => {
    const organizer =
      findMockOrganization(event.orgId)?.name ??
      mockAccounts.find((a) => a.userId === event.userId)?.fullName ??
      "";
    for (let i = 0; i < 3; i++) {
      n += 1;
      const payer = mockAccounts.find((a) => a.userId === PAYERS[(eventIndex + i) % PAYERS.length])!;
      const quantity = (i % 2) + 1;
      payments.push({
        paymentId: mockId("7", 0x100 + n),
        fullName: payer.fullName,
        amount: event.price * quantity,
        organizer,
        event: event.title,
        date: isoFromNow(-(eventIndex * 4 + i * 2 + 1), 9 + i * 3),
      });
    }
  });
  return payments;
}

export const mockAdminPayments = buildPayments();
