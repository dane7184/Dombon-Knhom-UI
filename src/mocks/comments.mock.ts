// Comment threads for both events and activities. The backend uses the same
// ApiComment shape for GET /events/{id}/comment, /events/comment/{id}/replies,
// /activities/{id}/comments and /activities/comments/{id}/replies.

import type { ApiComment } from "@/types/event.type";
import { findMockAccount, findMockOrganization } from "@/mocks/auth.mock";
import { MOCK_ACTIVITY_IDS } from "@/mocks/activities.mock";
import { MOCK_EVENT_IDS } from "@/mocks/events.mock";
import { MOCK_ORG_IDS, MOCK_USER_IDS } from "@/mocks/ids";
import { mockId, nextMockId } from "@/mocks/utils";

export type CommentTarget = "event" | "activity";

export interface MockCommentRecord {
  commentId: string;
  target: CommentTarget;
  targetId: string;
  parentId: string | null;
  content: string;
  isEdited: boolean;
  createdAt: string;
  /** Author: org comments set orgId; user comments set userId. */
  userId: string | null;
  orgId: string | null;
}

interface CommentSeed {
  n: number;
  target: CommentTarget;
  targetId: string;
  parent?: number;
  content: string;
  userId?: string;
  orgId?: string;
  hoursAgo: number;
}

const seeds: CommentSeed[] = [
  // Event: Angkor Wat Sunrise Walk
  { n: 1, target: "event", targetId: MOCK_EVENT_IDS.angkorSunrise, content: "Is hotel pickup included?", userId: MOCK_USER_IDS.sokha, hoursAgo: 30 },
  { n: 2, target: "event", targetId: MOCK_EVENT_IDS.angkorSunrise, parent: 1, content: "Yes! Pickup within Siem Reap town is included.", orgId: MOCK_ORG_IDS.angkor, hoursAgo: 29 },
  { n: 3, target: "event", targetId: MOCK_EVENT_IDS.angkorSunrise, parent: 2, content: "Perfect, thank you 🙏", userId: MOCK_USER_IDS.sokha, hoursAgo: 28 },
  { n: 4, target: "event", targetId: MOCK_EVENT_IDS.angkorSunrise, content: "Did this last month, the breakfast was amazing.", userId: MOCK_USER_IDS.chenda, hoursAgo: 20 },
  { n: 5, target: "event", targetId: MOCK_EVENT_IDS.angkorSunrise, content: "Can kids join?", userId: MOCK_USER_IDS.pisey, hoursAgo: 8 },
  { n: 6, target: "event", targetId: MOCK_EVENT_IDS.angkorSunrise, parent: 5, content: "Children under 12 join for free with an adult.", orgId: MOCK_ORG_IDS.angkor, hoursAgo: 7 },
  // Event: Bonfire Night
  { n: 7, target: "event", targetId: MOCK_EVENT_IDS.bonfireNight, content: "What time does the dance start?", userId: MOCK_USER_IDS.sreypov, hoursAgo: 50 },
  { n: 8, target: "event", targetId: MOCK_EVENT_IDS.bonfireNight, parent: 7, content: "Doors at 6pm, first performance 6:30pm.", orgId: MOCK_ORG_IDS.angkor, hoursAgo: 49 },
  { n: 9, target: "event", targetId: MOCK_EVENT_IDS.bonfireNight, content: "Bringing my whole family!", userId: MOCK_USER_IDS.bora, hoursAgo: 12 },
  { n: 10, target: "event", targetId: MOCK_EVENT_IDS.bonfireNight, content: "Is there parking nearby?", userId: MOCK_USER_IDS.pisey, hoursAgo: 4 },
  // Event: Water festival
  { n: 11, target: "event", targetId: MOCK_EVENT_IDS.waterFestival, content: "Best spot to watch the races?", userId: MOCK_USER_IDS.sokha, hoursAgo: 70 },
  { n: 12, target: "event", targetId: MOCK_EVENT_IDS.waterFestival, parent: 11, content: "Near the Royal Palace stands — arrive early!", userId: MOCK_USER_IDS.sreypov, hoursAgo: 69 },
  { n: 13, target: "event", targetId: MOCK_EVENT_IDS.waterFestival, content: "So excited 🚣", userId: MOCK_USER_IDS.bora, hoursAgo: 10 },
  // Activity: sunrise post
  { n: 20, target: "activity", targetId: MOCK_ACTIVITY_IDS.sunrisePost, content: "Gorgeous shot!", userId: MOCK_USER_IDS.chenda, hoursAgo: 1.5 },
  { n: 21, target: "activity", targetId: MOCK_ACTIVITY_IDS.sunrisePost, parent: 20, content: "Thank you! Taken from the north pond.", userId: MOCK_USER_IDS.sokha, hoursAgo: 1.2 },
  { n: 22, target: "activity", targetId: MOCK_ACTIVITY_IDS.sunrisePost, content: "Glad you enjoyed the walk 🌅", orgId: MOCK_ORG_IDS.angkor, hoursAgo: 1 },
  { n: 23, target: "activity", targetId: MOCK_ACTIVITY_IDS.sunrisePost, content: "Adding this to my list.", userId: MOCK_USER_IDS.pisey, hoursAgo: 0.5 },
  // Activity: bonfire announcement
  { n: 24, target: "activity", targetId: MOCK_ACTIVITY_IDS.bonfireAnnouncement, content: "Booked!", userId: MOCK_USER_IDS.bora, hoursAgo: 4 },
  { n: 25, target: "activity", targetId: MOCK_ACTIVITY_IDS.bonfireAnnouncement, content: "Any student discount?", userId: MOCK_USER_IDS.pisey, hoursAgo: 3 },
  // Activity: boat race video
  { n: 26, target: "activity", targetId: MOCK_ACTIVITY_IDS.boatRaceVideo, content: "The drums 🔥", userId: MOCK_USER_IDS.sokha, hoursAgo: 8 },
];

function fromSeed(seed: CommentSeed): MockCommentRecord {
  return {
    commentId: mockId("6", seed.n),
    target: seed.target,
    targetId: seed.targetId,
    parentId: seed.parent ? mockId("6", seed.parent) : null,
    content: seed.content,
    isEdited: false,
    createdAt: new Date(Date.now() - seed.hoursAgo * 3_600_000).toISOString(),
    userId: seed.orgId ? null : (seed.userId ?? null),
    orgId: seed.orgId ?? null,
  };
}

/** Mutable in-memory store. */
export const mockComments: MockCommentRecord[] = seeds.map(fromSeed);

export function findMockComment(commentId: string): MockCommentRecord | undefined {
  return mockComments.find((c) => c.commentId === commentId);
}

/** Top-level comments for a target, newest first. */
export function topLevelComments(target: CommentTarget, targetId: string): MockCommentRecord[] {
  return mockComments
    .filter((c) => c.target === target && c.targetId === targetId && c.parentId === null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Direct replies of a comment, oldest first (conversation order). */
export function repliesOf(commentId: string): MockCommentRecord[] {
  return mockComments
    .filter((c) => c.parentId === commentId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function toApiComment(c: MockCommentRecord): ApiComment {
  const account = c.userId ? findMockAccount(c.userId) : undefined;
  const org = c.orgId ? findMockOrganization(c.orgId) : undefined;
  return {
    commentId: c.commentId,
    content: c.content,
    isEdited: c.isEdited,
    parentId: c.parentId,
    createdAt: c.createdAt,
    userId: c.userId,
    fullName: account?.fullName ?? null,
    avatar: account?.avatar ?? null,
    orgId: c.orgId,
    orgName: org?.name ?? null,
    orgAvatar: org?.logo ?? null,
    hasReply: mockComments.some((r) => r.parentId === c.commentId),
  };
}

/** Adds a comment/reply authored by the current viewer (org mode posts as the org). */
export function addMockComment(input: {
  target: CommentTarget;
  targetId: string;
  parentId: string | null;
  content: string;
  userId: string | null;
  orgId: string | null;
}): MockCommentRecord {
  const record: MockCommentRecord = {
    commentId: nextMockId("6"),
    target: input.target,
    targetId: input.targetId,
    parentId: input.parentId,
    content: input.content,
    isEdited: false,
    createdAt: new Date().toISOString(),
    userId: input.orgId ? null : input.userId,
    orgId: input.orgId,
  };
  mockComments.push(record);
  return record;
}

/** Removes a comment and all of its descendants. Returns false if not found. */
export function removeMockComment(commentId: string): boolean {
  const toRemove = new Set<string>([commentId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const c of mockComments) {
      if (c.parentId && toRemove.has(c.parentId) && !toRemove.has(c.commentId)) {
        toRemove.add(c.commentId);
        grew = true;
      }
    }
  }
  const before = mockComments.length;
  for (let i = mockComments.length - 1; i >= 0; i--) {
    if (toRemove.has(mockComments[i].commentId)) mockComments.splice(i, 1);
  }
  return mockComments.length < before;
}
