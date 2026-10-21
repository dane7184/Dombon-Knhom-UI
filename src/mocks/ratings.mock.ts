// Mirrors GET /events/{eventId}/ratings → ApiRating[] (and the rating summary
// embedded in GET /events/{eventId}). Generated from each event's
// ratingCount/averageRating so list totals and summaries always agree.

import type { ApiRating, ApiRatingSummary } from "@/types/event.type";
import { MOCK_AVATARS } from "@/mocks/assets";
import { findMockAccount, mockAccounts } from "@/mocks/auth.mock";
import { mockEvents } from "@/mocks/events.mock";
import { mockId, nextMockId } from "@/mocks/utils";

export interface MockRatingRecord {
  ratingId: string;
  eventId: string;
  score: 1 | 2 | 3 | 4 | 5;
  review: string;
  createdAt: string;
  userId: string;
  fullName: string;
  avatar: string | null;
}

const REVIEWS: Record<number, string[]> = {
  5: ["Absolutely loved it, will come again!", "Well organized and great atmosphere.", "Best event I've been to this year."],
  4: ["Really good, a bit crowded at the start.", "Great vibe, parking was tricky.", "Enjoyed it a lot."],
  3: ["It was okay, expected a bit more.", "Decent, but started late."],
  2: ["Too crowded and hard to find the entrance."],
  1: ["Not what was advertised."],
};

const GIVEN_NAMES = ["Sophea", "Kosal", "Srey Leak", "Vichea", "Chanthou", "Ratana", "Makara", "Bopha", "Samnang", "Kanha"];
const FAMILY_NAMES = ["Chhay", "Keo", "Nget", "Long", "Yim", "Sar", "Hun", "Pen", "Touch", "Ly"];

/** Community accounts first, then generated reviewers (ids prefix "1", 0x100+). */
function reviewer(i: number): { userId: string; fullName: string; avatar: string | null } {
  const community = mockAccounts.filter((a) => a.role === "User" || a.role === "Organizer");
  if (i < community.length) {
    const a = community[i];
    return { userId: a.userId, fullName: a.fullName, avatar: a.avatar };
  }
  const n = i - community.length;
  return {
    userId: mockId("1", 0x100 + n),
    fullName: `${GIVEN_NAMES[n % GIVEN_NAMES.length]} ${FAMILY_NAMES[Math.floor(n / GIVEN_NAMES.length) % FAMILY_NAMES.length]}`,
    avatar: MOCK_AVATARS.fallback,
  };
}

function scoreFor(i: number, average: number): 1 | 2 | 3 | 4 | 5 {
  const base = Math.floor(average);
  const fraction = average - base;
  const score = ((i * 7) % 10) / 10 < fraction ? base + 1 : base;
  return Math.min(5, Math.max(1, score)) as 1 | 2 | 3 | 4 | 5;
}

function generate(): MockRatingRecord[] {
  const ratings: MockRatingRecord[] = [];
  let n = 0x200;
  for (const event of mockEvents) {
    for (let i = 0; i < event.ratingCount; i++) {
      const who = reviewer(i);
      const score = scoreFor(i, event.averageRating);
      const reviews = REVIEWS[score];
      const created = new Date(event.endAt);
      created.setHours(created.getHours() + 2 + i * 5);
      n += 1;
      ratings.push({
        ratingId: mockId("6", n),
        eventId: event.eventId,
        score,
        review: reviews[i % reviews.length],
        createdAt: created.toISOString(),
        ...who,
      });
    }
  }
  return ratings;
}

/** Mutable in-memory store. */
export const mockRatings: MockRatingRecord[] = generate();

/** Ratings of one event, newest first. */
export function ratingsOfEvent(eventId: string): MockRatingRecord[] {
  return mockRatings
    .filter((r) => r.eventId === eventId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function toApiRating(r: MockRatingRecord, totalCount: number): ApiRating {
  return {
    ratingId: r.ratingId,
    score: r.score,
    review: r.review,
    createdAt: r.createdAt,
    userId: r.userId,
    fullName: r.fullName,
    avatar: r.avatar,
    totalCount,
  };
}

/** Star breakdown; null when the event has no ratings (as the backend does). */
export function ratingSummaryOf(eventId: string): ApiRatingSummary | null {
  const list = ratingsOfEvent(eventId);
  if (list.length === 0) return null;
  const count = (s: number) => list.filter((r) => r.score === s).length;
  const average = list.reduce((sum, r) => sum + r.score, 0) / list.length;
  return {
    average: Math.round(average * 10) / 10,
    fiveStar: count(5),
    fourStar: count(4),
    threeStar: count(3),
    twoStar: count(2),
    oneStar: count(1),
    total: list.length,
  };
}

/** Adds or replaces the viewer's rating for an event. */
export function upsertMockRating(
  eventId: string,
  userId: string,
  score: 1 | 2 | 3 | 4 | 5,
  review: string,
): MockRatingRecord {
  const existing = mockRatings.find((r) => r.eventId === eventId && r.userId === userId);
  if (existing) {
    existing.score = score;
    existing.review = review;
    existing.createdAt = new Date().toISOString();
    return existing;
  }
  const account = findMockAccount(userId);
  const record: MockRatingRecord = {
    ratingId: nextMockId("6"),
    eventId,
    score,
    review,
    createdAt: new Date().toISOString(),
    userId,
    fullName: account?.fullName ?? "Mock user",
    avatar: account?.avatar ?? null,
  };
  mockRatings.push(record);
  return record;
}
