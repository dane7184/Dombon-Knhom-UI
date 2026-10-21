// Profile-specific mock state: user badges, favorites between users and
// organizations, and organizer requests submitted from the profile page.
// Event / activity / organization records themselves live in their own files.

import type { BadgeResponse } from "@/types/user.type";
import { mockOrganizations } from "@/mocks/organizer.mock";
import { MOCK_USER_IDS } from "@/mocks/ids";
import { monthKey } from "@/mocks/utils";

// ── Badges ───────────────────────────────────────────────────

/** Badge types match the keys in constant/badges.config.ts. */
export const mockUserBadges: Record<string, BadgeResponse[]> = {
  [MOCK_USER_IDS.sokha]: [
    { type: "FIRST_TIMER", quantity: 1, awardedMonths: [monthKey(-6)] },
    { type: "MEMORY_MAKER", quantity: 2, awardedMonths: [monthKey(-3), monthKey(-1)] },
    { type: "CITY_HOPPER", quantity: 1, awardedMonths: [monthKey(-2)] },
  ],
  [MOCK_USER_IDS.dara]: [{ type: "FIRST_TIMER", quantity: 1, awardedMonths: [monthKey(-9)] }],
  [MOCK_USER_IDS.chenda]: [{ type: "CONVERSATION_STARTER", quantity: 1, awardedMonths: [monthKey(-1)] }],
};

// ── Favorites ────────────────────────────────────────────────

/**
 * Users a given actor (user id, or org id in org mode) marked as favorite.
 * Organization favorites live on MockOrganizationProfile.favoritedBy.
 */
const userFavorites = new Map<string, Set<string>>([
  [MOCK_USER_IDS.sokha, new Set([MOCK_USER_IDS.chenda, MOCK_USER_IDS.sreypov])],
  [MOCK_USER_IDS.chenda, new Set([MOCK_USER_IDS.sokha])],
  [MOCK_USER_IDS.pisey, new Set([MOCK_USER_IDS.sokha])],
]);

/** When each favorite was added, keyed `${actorId}:${entityId}`. */
const favoritedAt = new Map<string, string>();

function favoriteKey(actorId: string, entityId: string): string {
  return `${actorId}:${entityId}`;
}

export function favoriteCreatedAt(actorId: string, entityId: string): string {
  return favoritedAt.get(favoriteKey(actorId, entityId)) ?? "2026-05-01T09:00:00.000Z";
}

export function favoriteUserIds(actorId: string): string[] {
  return [...(userFavorites.get(actorId) ?? [])];
}

export function isUserFavoritedBy(userId: string, actorId: string | null | undefined): boolean {
  if (!actorId) return false;
  return userFavorites.get(actorId)?.has(userId) ?? false;
}

/** How many accounts/organizations favorited this user. */
export function userFavoriteCount(userId: string): number {
  let count = 0;
  for (const set of userFavorites.values()) if (set.has(userId)) count++;
  return count;
}

/** Flips a user favorite and returns the new state. */
export function toggleUserFavorite(actorId: string, userId: string): boolean {
  const set = userFavorites.get(actorId) ?? new Set<string>();
  userFavorites.set(actorId, set);
  if (set.has(userId)) {
    set.delete(userId);
    favoritedAt.delete(favoriteKey(actorId, userId));
    return false;
  }
  set.add(userId);
  favoritedAt.set(favoriteKey(actorId, userId), new Date().toISOString());
  return true;
}

/** Flips an organization favorite and returns the new state. */
export function toggleOrganizationFavorite(actorId: string, orgId: string): boolean {
  const org = mockOrganizations.find((o) => o.orgId === orgId);
  if (!org) throw new Error("Organization not found");
  if (org.favoritedBy.has(actorId)) {
    org.favoritedBy.delete(actorId);
    favoritedAt.delete(favoriteKey(actorId, orgId));
    return false;
  }
  org.favoritedBy.add(actorId);
  favoritedAt.set(favoriteKey(actorId, orgId), new Date().toISOString());
  return true;
}

export function favoriteOrganizationIds(actorId: string): string[] {
  return mockOrganizations.filter((o) => o.favoritedBy.has(actorId)).map((o) => o.orgId);
}

// ── Organizer requests (POST /users/organization) ────────────

export interface MockOrganizerRequest {
  orgId: string;
  requestedBy: string;
  name: string;
  province: string;
  phone: string;
  website?: string;
  about: string;
  status: "Pending";
  createdAt: string;
}

/** Requests created at runtime; in-memory only. */
export const mockOrganizerRequests: MockOrganizerRequest[] = [];
