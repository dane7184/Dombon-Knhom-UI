// Mirrors GET /notifications → NotificationItem[]. Every notification points at
// a real mock event, activity or comment so clicking it navigates somewhere
// that exists. Recipients are a user id (user mode) or an org id (org mode).

import type { NotificationItem, NotificationTargetType, NotificationType } from "@/types/notification.type";
import { MOCK_AVATARS } from "@/mocks/assets";
import { findMockAccount, findMockOrganization } from "@/mocks/auth.mock";
import { MOCK_ACTIVITY_IDS } from "@/mocks/activities.mock";
import { MOCK_EVENT_IDS } from "@/mocks/events.mock";
import { MOCK_ORG_IDS, MOCK_USER_IDS } from "@/mocks/ids";
import { mockId, nextMockId } from "@/mocks/utils";

export interface MockNotificationRecord extends NotificationItem {
  recipientId: string;
}

interface NotificationSeed {
  n: number;
  recipientId: string;
  type: NotificationType;
  notifiableId: string;
  targetId: string | null;
  targetType: NotificationTargetType | null;
  title: string;
  /** User or organization id of whoever triggered it; null = the platform. */
  actorId: string | null;
  hoursAgo: number;
  read?: boolean;
}

const seeds: NotificationSeed[] = [
  // ── Sokha (regular user) ──────────────────────────────────
  {
    n: 1,
    recipientId: MOCK_USER_IDS.sokha,
    type: "Comment",
    notifiableId: mockId("6", 23), // Pisey's comment on Sokha's sunrise post
    targetId: MOCK_ACTIVITY_IDS.sunrisePost,
    targetType: "Activity",
    title: "commented on your post",
    actorId: MOCK_USER_IDS.pisey,
    hoursAgo: 0.5,
  },
  {
    n: 2,
    recipientId: MOCK_USER_IDS.sokha,
    type: "Like",
    notifiableId: MOCK_ACTIVITY_IDS.sunrisePost,
    targetId: MOCK_ACTIVITY_IDS.sunrisePost,
    targetType: "Activity",
    title: "liked your post",
    actorId: MOCK_USER_IDS.chenda,
    hoursAgo: 1.4,
  },
  {
    n: 3,
    recipientId: MOCK_USER_IDS.sokha,
    type: "Comment",
    notifiableId: mockId("6", 2), // org reply to Sokha's question on the sunrise event
    targetId: MOCK_EVENT_IDS.angkorSunrise,
    targetType: "Event",
    title: "replied to your comment on {{Angkor Wat Sunrise Walk}}",
    actorId: MOCK_ORG_IDS.angkor,
    hoursAgo: 29,
  },
  {
    n: 4,
    recipientId: MOCK_USER_IDS.sokha,
    type: "JoinEventSuccess",
    notifiableId: MOCK_EVENT_IDS.foodExpo,
    targetId: MOCK_EVENT_IDS.foodExpo,
    targetType: "Event",
    title: "confirmed your ticket for {{Khmer Food Expo 2026}}",
    actorId: MOCK_ORG_IDS.mekong,
    hoursAgo: 50,
    read: true,
  },
  {
    n: 5,
    recipientId: MOCK_USER_IDS.sokha,
    type: "EventApproved",
    notifiableId: MOCK_EVENT_IDS.bambooTrain,
    targetId: MOCK_EVENT_IDS.bambooTrain,
    targetType: "Event",
    title: "approved your event {{Battambang Bamboo Train Ride Meetup}}",
    actorId: null,
    hoursAgo: 120,
    read: true,
  },

  // ── Angkor Events Collective (Dara in org mode) ───────────
  {
    n: 20,
    recipientId: MOCK_ORG_IDS.angkor,
    type: "JoinEvent",
    notifiableId: MOCK_EVENT_IDS.angkorSunrise,
    targetId: MOCK_EVENT_IDS.angkorSunrise,
    targetType: "Event",
    title: "joined {{Angkor Wat Sunrise Walk}}",
    actorId: MOCK_USER_IDS.pisey,
    hoursAgo: 2,
  },
  {
    n: 21,
    recipientId: MOCK_ORG_IDS.angkor,
    type: "Comment",
    notifiableId: mockId("6", 10), // parking question on Bonfire Night
    targetId: MOCK_EVENT_IDS.bonfireNight,
    targetType: "Event",
    title: "commented on {{Angkor Cultural Bonfire Night}}",
    actorId: MOCK_USER_IDS.pisey,
    hoursAgo: 4,
  },
  {
    n: 22,
    recipientId: MOCK_ORG_IDS.angkor,
    type: "Like",
    notifiableId: MOCK_ACTIVITY_IDS.bonfireAnnouncement,
    targetId: MOCK_ACTIVITY_IDS.bonfireAnnouncement,
    targetType: "Activity",
    title: "liked your post",
    actorId: MOCK_USER_IDS.bora,
    hoursAgo: 6,
  },
  {
    n: 23,
    recipientId: MOCK_ORG_IDS.angkor,
    type: "WithdrawalApproved",
    notifiableId: mockId("7", 5),
    targetId: MOCK_ORG_IDS.angkor,
    targetType: "Org",
    title: "approved your withdrawal of $600",
    actorId: null,
    hoursAgo: 9 * 24,
    read: true,
  },
  {
    n: 24,
    recipientId: MOCK_ORG_IDS.angkor,
    type: "EventRejected",
    notifiableId: MOCK_EVENT_IDS.rejectedRave,
    targetId: MOCK_EVENT_IDS.rejectedRave,
    targetType: "Event",
    title: "rejected your event {{Late Night Rave at the Ruins}}",
    actorId: null,
    hoursAgo: 4 * 24,
  },
  {
    n: 25,
    recipientId: MOCK_ORG_IDS.angkor,
    type: "Rated",
    notifiableId: MOCK_EVENT_IDS.artMarket,
    targetId: MOCK_EVENT_IDS.artMarket,
    targetType: "Event",
    title: "rated {{Siem Reap Night Art Market}} 5 stars",
    actorId: MOCK_USER_IDS.chenda,
    hoursAgo: 15 * 24,
    read: true,
  },

  // ── Dara (organizer owner, user mode) ─────────────────────
  {
    n: 40,
    recipientId: MOCK_USER_IDS.dara,
    type: "OrgRequestApproved",
    notifiableId: MOCK_ORG_IDS.angkor,
    targetId: MOCK_ORG_IDS.angkor,
    targetType: "Org",
    title: "approved your organization {{Angkor Events Collective}}",
    actorId: null,
    hoursAgo: 60 * 24,
    read: true,
  },
];

function actor(actorId: string | null): { actorName: string; actorAvatar: string | null } {
  if (!actorId) return { actorName: "Dombon Khnom", actorAvatar: MOCK_AVATARS.logo };
  const org = findMockOrganization(actorId);
  if (org) return { actorName: org.name, actorAvatar: org.logo };
  const account = findMockAccount(actorId);
  return { actorName: account?.fullName ?? "Someone", actorAvatar: account?.avatar ?? null };
}

function fromSeed(seed: NotificationSeed): MockNotificationRecord {
  const createdAt = new Date(Date.now() - seed.hoursAgo * 3_600_000).toISOString();
  return {
    recipientId: seed.recipientId,
    notificationId: mockId("c", seed.n),
    notifiableType: seed.type,
    notifiableId: seed.notifiableId,
    targetId: seed.targetId,
    targetType: seed.targetType,
    title: seed.title,
    readAt: seed.read ? createdAt : null,
    createdAt,
    ...actor(seed.actorId),
    read: seed.read ?? false,
  };
}

/** Mutable in-memory store. */
export const mockNotifications: MockNotificationRecord[] = seeds.map(fromSeed);

/** Notifications for a recipient, newest first. */
export function notificationsFor(recipientId: string | null | undefined): MockNotificationRecord[] {
  if (!recipientId) return [];
  return mockNotifications
    .filter((n) => n.recipientId === recipientId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function toNotificationItem(record: MockNotificationRecord): NotificationItem {
  // Leaves out the mock-only recipientId so callers get exactly the API shape.
  return {
    notificationId: record.notificationId,
    notifiableType: record.notifiableType,
    notifiableId: record.notifiableId,
    targetId: record.targetId,
    targetType: record.targetType,
    title: record.title,
    readAt: record.readAt,
    createdAt: record.createdAt,
    actorName: record.actorName,
    actorAvatar: record.actorAvatar,
    read: record.read,
  };
}

/**
 * A "live" notification used by the mock SSE stream: someone likes the
 * recipient's most relevant post. Added to the store so the list matches the
 * unread badge.
 */
export function createLiveMockNotification(recipientId: string): MockNotificationRecord {
  const isOrg = Boolean(findMockOrganization(recipientId));
  const record: MockNotificationRecord = {
    recipientId,
    notificationId: nextMockId("c"),
    notifiableType: "Like",
    notifiableId: isOrg ? MOCK_ACTIVITY_IDS.bonfireAnnouncement : MOCK_ACTIVITY_IDS.sunrisePost,
    targetId: isOrg ? MOCK_ACTIVITY_IDS.bonfireAnnouncement : MOCK_ACTIVITY_IDS.sunrisePost,
    targetType: "Activity",
    title: "liked your post",
    readAt: null,
    createdAt: new Date().toISOString(),
    ...actor(MOCK_USER_IDS.sreypov),
    read: false,
  };
  mockNotifications.push(record);
  return record;
}
