// Organization profiles plus the organizer dashboard data (KPI inputs,
// like/attendee stats, wallet). Event lists come from events.mock.ts and
// money movements from transactions.mock.ts / earnings.mock.ts.

import type { ApiBadge } from "@/types/event.type";
import type { TotalLikeAndAttendee } from "@/types/organizer.type";
import { findMockOrganization } from "@/mocks/auth.mock";
import { MOCK_ORG_IDS, MOCK_USER_IDS } from "@/mocks/ids";
import { mockId, monthKey } from "@/mocks/utils";

export interface MockOrganizationProfile {
  orgId: string;
  name: string;
  logo: string;
  about: string;
  phone: string;
  website: string;
  province: string;
  badge: ApiBadge[];
  /** Users/orgs that marked this organization as a favorite. */
  favoritedBy: Set<string>;
  /** Count shown on the profile; seeded higher than favoritedBy to look realistic. */
  baseFavoriteCount: number;
  createdAt: string;
}

function identity(orgId: string) {
  const org = findMockOrganization(orgId);
  if (!org) throw new Error(`Unknown mock organization ${orgId}`);
  return org;
}

export const mockOrganizations: MockOrganizationProfile[] = [
  {
    orgId: MOCK_ORG_IDS.angkor,
    name: identity(MOCK_ORG_IDS.angkor).name,
    logo: identity(MOCK_ORG_IDS.angkor).logo,
    about:
      "Angkor Events Collective curates cultural nights, sunrise walks and festivals around Siem Reap, working with local guides, artists and families.",
    phone: "+855 12 345 678",
    website: "https://angkor-events.example.com",
    province: "Siem_Reap",
    badge: [
      { type: "TopOrganizer", quantity: 2, awardedMonths: [monthKey(-3), monthKey(-1)] },
      { type: "CommunityFavorite", quantity: 1, awardedMonths: [monthKey(-2)] },
    ],
    favoritedBy: new Set([MOCK_USER_IDS.sokha, MOCK_USER_IDS.chenda]),
    baseFavoriteCount: 1282,
    createdAt: "2025-08-20T09:00:00.000Z",
  },
  {
    orgId: MOCK_ORG_IDS.mekong,
    name: identity(MOCK_ORG_IDS.mekong).name,
    logo: identity(MOCK_ORG_IDS.mekong).logo,
    about: "Street food nights and food expos celebrating flavours from every Cambodian province.",
    phone: "+855 98 765 432",
    website: "https://mekong-food.example.com",
    province: "Kampot",
    badge: [{ type: "TopOrganizer", quantity: 1, awardedMonths: [monthKey(-4)] }],
    favoritedBy: new Set([MOCK_USER_IDS.pisey]),
    baseFavoriteCount: 640,
    createdAt: "2025-09-05T09:00:00.000Z",
  },
  {
    orgId: MOCK_ORG_IDS.techHub,
    name: identity(MOCK_ORG_IDS.techHub).name,
    logo: identity(MOCK_ORG_IDS.techHub).logo,
    about: "Meetups, hackathons and the annual Phnom Penh Tech Summit.",
    phone: "+855 77 222 111",
    website: "https://pp-techhub.example.com",
    province: "Phnom_Penh",
    badge: [],
    favoritedBy: new Set(),
    baseFavoriteCount: 415,
    createdAt: "2025-09-22T09:00:00.000Z",
  },
];

export function findMockOrganizationProfile(orgId: string | null | undefined): MockOrganizationProfile | undefined {
  return mockOrganizations.find((o) => o.orgId === orgId);
}

export function organizationFavoriteCount(org: MockOrganizationProfile): number {
  return org.baseFavoriteCount + org.favoritedBy.size;
}

// ── Monthly likes / attendees (GET /organizations/{orgId}/stats) ──

const LIKES_PER_MONTH = [180, 210, 260, 520, 340, 290, 310, 380, 420, 465, 530, 610];
const ATTENDEES_PER_MONTH = [95, 120, 140, 410, 220, 180, 205, 260, 300, 330, 390, 455];

/** Last 12 months including the current one, oldest first. */
export const mockOrganizerStats: TotalLikeAndAttendee[] = LIKES_PER_MONTH.map((likes, i) => ({
  month: monthKey(i - 11),
  totalLikes: likes,
  totalAttendees: ATTENDEES_PER_MONTH[i],
}));

// ── Wallet (GET /organizations/wallet) ───────────────────────

export const mockWalletIds: Record<string, string> = {
  [MOCK_ORG_IDS.angkor]: mockId("d", 1),
  [MOCK_ORG_IDS.mekong]: mockId("d", 2),
  [MOCK_ORG_IDS.techHub]: mockId("d", 3),
};

export const MOCK_WALLET_CURRENCY = "USD";
