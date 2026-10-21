// Mock accounts and organizations used for authentication, profiles and as
// authors throughout the other fixtures.
//
// Tokens produced here are unsigned placeholders shaped like a JWT (so
// lib/auth.ts can read the `exp` claim). They are not real credentials and
// are never accepted by the real backend.

import type { Gender, Role } from "@/types/common.type";
import { MOCK_AVATARS } from "@/mocks/assets";
import { MOCK_ORG_IDS, MOCK_USER_IDS } from "@/mocks/ids";

/** Shared password for every mock login account — matches the README test accounts. */
export const MOCK_PASSWORD = "Koko@1234";

/** Any 6 digits are accepted as an OTP in mock mode except this one, which fails. */
export const MOCK_INVALID_OTP = "000000";

export interface MockAccount {
  userId: string;
  fullName: string;
  email: string;
  avatar: string | null;
  role: Role;
  province: string;
  gender: Gender;
  bio: string;
  createdAt: string;
  /** Organization this account owns, if any. */
  orgId: string | null;
  /** Only accounts with a login can sign in; the rest are fixture authors. */
  canLogin: boolean;
}

export interface MockOrganizationIdentity {
  orgId: string;
  name: string;
  logo: string;
  ownerId: string;
}

export const mockAccounts: MockAccount[] = [
  {
    userId: MOCK_USER_IDS.sokha,
    fullName: "Sokha Chan",
    email: "dane003@gmail.com",
    avatar: MOCK_AVATARS.user,
    role: "User",
    province: "Phnom_Penh",
    gender: "Female",
    bio: "Weekend explorer chasing festivals, street food and sunrise spots around Cambodia.",
    createdAt: "2025-11-02T08:15:00.000Z",
    orgId: null,
    canLogin: true,
  },
  {
    userId: MOCK_USER_IDS.dara,
    fullName: "Dara Kim",
    email: "dane004@gmail.com",
    avatar: MOCK_AVATARS.profile,
    role: "Organizer",
    province: "Siem_Reap",
    gender: "Male",
    bio: "Event producer based in Siem Reap. Runs Angkor Events Collective.",
    createdAt: "2025-08-19T10:30:00.000Z",
    orgId: MOCK_ORG_IDS.angkor,
    canLogin: true,
  },
  {
    userId: MOCK_USER_IDS.moderator,
    fullName: "Malis Nhem",
    email: "dane002@gmail.com",
    avatar: MOCK_AVATARS.profile,
    role: "Moderator",
    province: "Phnom_Penh",
    gender: "Female",
    bio: "Content moderator.",
    createdAt: "2025-07-01T09:00:00.000Z",
    orgId: null,
    canLogin: true,
  },
  {
    userId: MOCK_USER_IDS.admin,
    fullName: "Visal Prak",
    email: "dane001@gmail.com",
    avatar: MOCK_AVATARS.profile,
    role: "Admin",
    province: "Phnom_Penh",
    gender: "Male",
    bio: "Platform administrator.",
    createdAt: "2025-06-15T09:00:00.000Z",
    orgId: null,
    canLogin: true,
  },
  {
    userId: MOCK_USER_IDS.vanna,
    fullName: "Vanna Lim",
    email: "vanna.lim@example.com",
    avatar: MOCK_AVATARS.fallback,
    role: "Organizer",
    province: "Kampot",
    gender: "Male",
    bio: "Food market organizer along the Mekong.",
    createdAt: "2025-09-03T11:00:00.000Z",
    orgId: MOCK_ORG_IDS.mekong,
    canLogin: false,
  },
  {
    userId: MOCK_USER_IDS.sreypov,
    fullName: "Sreypov Heng",
    email: "sreypov.heng@example.com",
    avatar: MOCK_AVATARS.fallback,
    role: "User",
    province: "Battambang",
    gender: "Female",
    bio: "Photographer and festival lover.",
    createdAt: "2025-10-12T07:45:00.000Z",
    orgId: null,
    canLogin: false,
  },
  {
    userId: MOCK_USER_IDS.rithy,
    fullName: "Rithy Sok",
    email: "rithy.sok@example.com",
    avatar: MOCK_AVATARS.fallback,
    role: "Organizer",
    province: "Phnom_Penh",
    gender: "Male",
    bio: "Software engineer and meetup host.",
    createdAt: "2025-09-21T13:20:00.000Z",
    orgId: MOCK_ORG_IDS.techHub,
    canLogin: false,
  },
  {
    userId: MOCK_USER_IDS.chenda,
    fullName: "Chenda Ouk",
    email: "chenda.ouk@example.com",
    avatar: MOCK_AVATARS.fallback,
    role: "User",
    province: "Siem_Reap",
    gender: "Female",
    bio: "Tour guide in Siem Reap.",
    createdAt: "2026-01-08T06:10:00.000Z",
    orgId: null,
    canLogin: false,
  },
  {
    userId: MOCK_USER_IDS.pisey,
    fullName: "Pisey Mao",
    email: "pisey.mao@example.com",
    avatar: MOCK_AVATARS.fallback,
    role: "User",
    province: "Kandal",
    gender: "Female",
    bio: "Student, loves live music.",
    createdAt: "2026-02-14T15:00:00.000Z",
    orgId: null,
    canLogin: false,
  },
  {
    userId: MOCK_USER_IDS.bora,
    fullName: "Bora Tep",
    email: "bora.tep@example.com",
    avatar: MOCK_AVATARS.fallback,
    role: "User",
    province: "Preah_Sihanouk",
    gender: "Male",
    bio: "Beach volleyball and boat races.",
    createdAt: "2026-03-30T10:00:00.000Z",
    orgId: null,
    canLogin: false,
  },
];

export const mockOrganizationIdentities: MockOrganizationIdentity[] = [
  {
    orgId: MOCK_ORG_IDS.angkor,
    name: "Angkor Events Collective",
    logo: MOCK_AVATARS.organization,
    ownerId: MOCK_USER_IDS.dara,
  },
  {
    orgId: MOCK_ORG_IDS.mekong,
    name: "Mekong Food Lovers",
    logo: MOCK_AVATARS.logo,
    ownerId: MOCK_USER_IDS.vanna,
  },
  {
    orgId: MOCK_ORG_IDS.techHub,
    name: "Phnom Penh Tech Hub",
    logo: MOCK_AVATARS.organization,
    ownerId: MOCK_USER_IDS.rithy,
  },
];

export function findMockAccount(userId: string | null | undefined): MockAccount | undefined {
  return mockAccounts.find((a) => a.userId === userId);
}

export function findMockAccountByEmail(email: string): MockAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return mockAccounts.find((a) => a.email.toLowerCase() === normalized);
}

export function findMockOrganization(orgId: string | null | undefined): MockOrganizationIdentity | undefined {
  return mockOrganizationIdentities.find((o) => o.orgId === orgId);
}

// ── Tokens ───────────────────────────────────────────────────

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

function base64UrlEncode(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Unsigned, JWT-shaped placeholder. Only `exp` is meaningful (lib/auth.ts checks it). */
export function createMockToken(claims: { sub: string; orgId?: string | null; type: "access" | "refresh" }): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({ ...claims, iat: now, exp: now + TOKEN_TTL_SECONDS, mock: true }),
  );
  return `${header}.${payload}.mock-signature`;
}

/** Reads the claims back out of a token made by createMockToken. */
export function readMockToken(token: string | null | undefined): { sub?: string; orgId?: string | null } | null {
  if (!token) return null;
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(part));
  } catch {
    return null;
  }
}
