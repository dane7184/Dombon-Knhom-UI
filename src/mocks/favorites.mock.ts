// Favorites between actors (users or organizations) and the users/orgs they
// follow. Mirrors GET /users/{userId}/favorite and
// GET /organizations/{orgId}/favorites → FavoriteItem[].
//
// Favorites of organizations are stored on the org profile
// (organizer.mock.ts `favoritedBy`); favorites of users are stored here.

import type { FavoriteItem } from "@/types/favorite.type";
import { findMockAccount } from "@/mocks/auth.mock";
import { MOCK_ORG_IDS, MOCK_USER_IDS } from "@/mocks/ids";
import { mockOrganizations, organizationFavoriteCount } from "@/mocks/organizer.mock";
import { mockId } from "@/mocks/utils";

/** targetUserId → actor ids (user or org) who favorited that user. */
export const userFavoritedBy = new Map<string, Set<string>>([
  [MOCK_USER_IDS.sreypov, new Set<string>([MOCK_USER_IDS.sokha, MOCK_ORG_IDS.angkor])],
  [MOCK_USER_IDS.chenda, new Set<string>([MOCK_USER_IDS.sokha])],
  [MOCK_USER_IDS.sokha, new Set<string>([MOCK_USER_IDS.chenda, MOCK_USER_IDS.pisey])],
  [MOCK_USER_IDS.bora, new Set<string>([MOCK_ORG_IDS.angkor])],
]);

/** When each favorite was created (key `${actorId}:${targetId}`), for sorting. */
const favoritedAt = new Map<string, string>();

function stamp(actorId: string, targetId: string, index: number): string {
  const key = `${actorId}:${targetId}`;
  if (!favoritedAt.has(key)) {
    favoritedAt.set(key, new Date(Date.now() - (index + 1) * 86_400_000 * 3).toISOString());
  }
  return favoritedAt.get(key)!;
}

export function userFavoriteCount(userId: string): number {
  return userFavoritedBy.get(userId)?.size ?? 0;
}

export function isUserFavoritedBy(userId: string, actorId: string | null | undefined): boolean {
  return !!actorId && (userFavoritedBy.get(userId)?.has(actorId) ?? false);
}

/** Toggles actor → user favorite; returns the new state. */
export function toggleUserFavorite(actorId: string, userId: string): boolean {
  const set = userFavoritedBy.get(userId) ?? new Set<string>();
  userFavoritedBy.set(userId, set);
  if (set.has(actorId)) {
    set.delete(actorId);
    favoritedAt.delete(`${actorId}:${userId}`);
    return false;
  }
  set.add(actorId);
  favoritedAt.set(`${actorId}:${userId}`, new Date().toISOString());
  return true;
}

/** Everything the actor has favorited, newest first. */
export function favoritesOf(actorId: string): FavoriteItem[] {
  const items: FavoriteItem[] = [];
  let i = 0;
  for (const [userId, actors] of userFavoritedBy) {
    if (!actors.has(actorId)) continue;
    const account = findMockAccount(userId);
    if (!account) continue;
    items.push({
      entityId: account.userId,
      entityType: "User",
      name: account.fullName,
      email: account.email,
      image: account.avatar,
      favoriteCount: userFavoriteCount(account.userId),
      createdAt: stamp(actorId, userId, i++),
      bookmarkId: mockId("b", 0x100 + i),
    });
  }
  for (const org of mockOrganizations) {
    if (!org.favoritedBy.has(actorId)) continue;
    items.push({
      entityId: org.orgId,
      entityType: "Organization",
      name: org.name,
      image: org.logo,
      favoriteCount: organizationFavoriteCount(org),
      createdAt: stamp(actorId, org.orgId, i++),
      bookmarkId: mockId("b", 0x100 + i),
    });
  }
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
