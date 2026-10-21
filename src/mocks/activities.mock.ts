// Mock activities (user/organization posts). Mirrors the RawActivityItem shape
// returned by GET /activities/feed and GET /activities/{activityId}.

import type { RawActivityItem } from "@/types/activity.type";
import { MOCK_IMAGES, MOCK_VIDEO, poolImage } from "@/mocks/assets";
import { findMockAccount, findMockOrganization } from "@/mocks/auth.mock";
import { findMockEvent, MOCK_EVENT_IDS } from "@/mocks/events.mock";
import { MOCK_ORG_IDS, MOCK_USER_IDS } from "@/mocks/ids";
import { mockId } from "@/mocks/utils";

export type MockMedia = RawActivityItem["media"][number];

export interface MockActivityRecord {
  activityId: string;
  content: string;
  province: string;
  /** Author: exactly one of userId / orgId is set. */
  userId: string | null;
  orgId: string | null;
  eventId: string | null;
  tags: { tagId: string; name: string }[];
  media: MockMedia[];
  likeCount: number;
  commentCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export const MOCK_TAGS = {
  festival: { tagId: mockId("9", 1), name: "festival" },
  angkor: { tagId: mockId("9", 2), name: "angkor" },
  food: { tagId: mockId("9", 3), name: "streetfood" },
  sunrise: { tagId: mockId("9", 4), name: "sunrise" },
  culture: { tagId: mockId("9", 5), name: "khmerculture" },
  music: { tagId: mockId("9", 6), name: "livemusic" },
  travel: { tagId: mockId("9", 7), name: "travelcambodia" },
  tech: { tagId: mockId("9", 8), name: "techcambodia" },
  waterfest: { tagId: mockId("9", 9), name: "bonomtouk" },
} as const;

let mediaCounter = 0;

function image(url: string): MockMedia {
  mediaCounter += 1;
  return { actMediaId: mockId("5", mediaCounter), sortOrder: 0, fileUrl: url, type: "Image", durationSeconds: null };
}

function video(): MockMedia {
  mediaCounter += 1;
  return {
    actMediaId: mockId("5", mediaCounter),
    sortOrder: 0,
    fileUrl: MOCK_VIDEO.url,
    type: "Video",
    durationSeconds: MOCK_VIDEO.durationSeconds,
  };
}

function ordered(media: MockMedia[]): MockMedia[] {
  return media.map((m, i) => ({ ...m, sortOrder: i }));
}

interface ActivitySeed {
  n: number;
  content: string;
  province: string;
  userId?: string;
  orgId?: string;
  eventId?: string;
  tags: { tagId: string; name: string }[];
  media: MockMedia[];
  likes: number;
  comments: number;
  hoursAgo: number;
}

const seeds: ActivitySeed[] = [
  {
    n: 1,
    content: "Sunrise over Angkor Wat this morning was unreal. Worth every minute of the 4:30am alarm 🌅",
    province: "Siem_Reap",
    userId: MOCK_USER_IDS.sokha,
    eventId: MOCK_EVENT_IDS.angkorSunrise,
    tags: [MOCK_TAGS.sunrise, MOCK_TAGS.angkor],
    media: [image(MOCK_IMAGES.angkorSunrise), image(MOCK_IMAGES.eventCard)],
    likes: 128,
    comments: 4,
    hoursAgo: 2,
  },
  {
    n: 2,
    content: "Tickets for the Cultural Bonfire Night are now open! Apsara dancers, pinpeat music and stories under the stars.",
    province: "Siem_Reap",
    orgId: MOCK_ORG_IDS.angkor,
    eventId: MOCK_EVENT_IDS.bonfireNight,
    tags: [MOCK_TAGS.culture, MOCK_TAGS.angkor],
    media: [image(MOCK_IMAGES.bonfireNight)],
    likes: 342,
    comments: 2,
    hoursAgo: 5,
  },
  {
    n: 3,
    content: "Quick clip from the riverside rehearsal for the boat race 🚣",
    province: "Phnom_Penh",
    userId: MOCK_USER_IDS.sreypov,
    eventId: MOCK_EVENT_IDS.waterFestival,
    tags: [MOCK_TAGS.waterfest, MOCK_TAGS.festival],
    media: [video()],
    likes: 87,
    comments: 1,
    hoursAgo: 9,
  },
  {
    n: 4,
    content: "Kampot crab and pepper sauce. That's it, that's the post.",
    province: "Kampot",
    orgId: MOCK_ORG_IDS.mekong,
    eventId: MOCK_EVENT_IDS.kampotStreetFood,
    tags: [MOCK_TAGS.food],
    media: [image(MOCK_IMAGES.foodFestival), image(MOCK_IMAGES.khmerFoodExpo), image(MOCK_IMAGES.locationImage)],
    likes: 211,
    comments: 0,
    hoursAgo: 20,
  },
  {
    n: 5,
    content: "Speaker line-up for the Tech Summit is live — AI, fintech and a startup pitch stage.",
    province: "Phnom_Penh",
    orgId: MOCK_ORG_IDS.techHub,
    eventId: MOCK_EVENT_IDS.techSummit,
    tags: [MOCK_TAGS.tech],
    media: [image(MOCK_IMAGES.techSummit)],
    likes: 156,
    comments: 0,
    hoursAgo: 28,
  },
  {
    n: 6,
    content: "The art market lanterns were so pretty last night.",
    province: "Siem_Reap",
    userId: MOCK_USER_IDS.chenda,
    eventId: MOCK_EVENT_IDS.artMarket,
    tags: [MOCK_TAGS.culture],
    media: [image(MOCK_IMAGES.art)],
    likes: 64,
    comments: 0,
    hoursAgo: 40,
  },
  {
    n: 7,
    content: "Dancing all night at the open-air stage 🎶",
    province: "Phnom_Penh",
    userId: MOCK_USER_IDS.pisey,
    tags: [MOCK_TAGS.music],
    media: [image(MOCK_IMAGES.edmFestival), image(MOCK_IMAGES.musicEvent)],
    likes: 99,
    comments: 0,
    hoursAgo: 52,
  },
  {
    n: 8,
    content: "Behind the scenes while setting up the Royal Ballet evening.",
    province: "Siem_Reap",
    orgId: MOCK_ORG_IDS.angkor,
    eventId: MOCK_EVENT_IDS.royalBallet,
    tags: [MOCK_TAGS.culture],
    media: [video(), image(MOCK_IMAGES.musicEvent)],
    likes: 175,
    comments: 0,
    hoursAgo: 70,
  },
  {
    n: 9,
    content: "Water festival vibes from last year. Can't wait for this one!",
    province: "Phnom_Penh",
    userId: MOCK_USER_IDS.bora,
    tags: [MOCK_TAGS.waterfest, MOCK_TAGS.travel],
    media: [image(MOCK_IMAGES.waterFestival)],
    likes: 47,
    comments: 0,
    hoursAgo: 96,
  },
  {
    n: 10,
    content: "Food expo prep: 25 provinces, 25 signature dishes.",
    province: "Phnom_Penh",
    orgId: MOCK_ORG_IDS.mekong,
    eventId: MOCK_EVENT_IDS.foodExpo,
    tags: [MOCK_TAGS.food, MOCK_TAGS.festival],
    media: [image(MOCK_IMAGES.khmerFoodExpo)],
    likes: 133,
    comments: 0,
    hoursAgo: 120,
  },
  {
    n: 11,
    content: "Golden hour at Ta Prohm. Photo workshop coming soon 📸",
    province: "Siem_Reap",
    orgId: MOCK_ORG_IDS.angkor,
    tags: [MOCK_TAGS.angkor, MOCK_TAGS.travel],
    media: [image(poolImage(9)), image(poolImage(0))],
    likes: 88,
    comments: 0,
    hoursAgo: 150,
  },
  {
    n: 12,
    content: "Bamboo train ride with friends — highly recommend.",
    province: "Battambang",
    userId: MOCK_USER_IDS.sokha,
    eventId: MOCK_EVENT_IDS.bambooTrain,
    tags: [MOCK_TAGS.travel],
    media: [image(MOCK_IMAGES.eventFeedback)],
    likes: 31,
    comments: 0,
    hoursAgo: 190,
  },
  {
    n: 13,
    content: "Khmer New Year water blessings 💦",
    province: "Siem_Reap",
    userId: MOCK_USER_IDS.chenda,
    eventId: MOCK_EVENT_IDS.khmerNewYear,
    tags: [MOCK_TAGS.festival, MOCK_TAGS.culture],
    media: [image(MOCK_IMAGES.topEventCard)],
    likes: 205,
    comments: 0,
    hoursAgo: 260,
  },
  {
    n: 14,
    content: "Riverside walk before the food night.",
    province: "Kampot",
    userId: MOCK_USER_IDS.vanna,
    tags: [MOCK_TAGS.travel],
    media: [image(MOCK_IMAGES.locationImage)],
    likes: 19,
    comments: 0,
    hoursAgo: 330,
  },
  {
    n: 15,
    content: "Charity run finish line! Thanks to everyone who joined.",
    province: "Kep",
    userId: MOCK_USER_IDS.bora,
    eventId: MOCK_EVENT_IDS.charityRun,
    tags: [MOCK_TAGS.travel],
    media: [image(MOCK_IMAGES.waterFestivalAlt)],
    likes: 72,
    comments: 0,
    hoursAgo: 420,
  },
  {
    n: 16,
    content: "Lantern-lit evening at the temples.",
    province: "Siem_Reap",
    orgId: MOCK_ORG_IDS.angkor,
    tags: [MOCK_TAGS.angkor],
    media: [image(MOCK_IMAGES.bonfireNight), image(MOCK_IMAGES.angkorSunrise)],
    likes: 140,
    comments: 0,
    hoursAgo: 500,
  },
  {
    n: 17,
    content: "Drafting a post about my favourite noodle stalls…",
    province: "Phnom_Penh",
    userId: MOCK_USER_IDS.sokha,
    tags: [MOCK_TAGS.food],
    media: [image(MOCK_IMAGES.foodFestival)],
    likes: 0,
    comments: 0,
    hoursAgo: 600,
  },
];

function fromSeed(seed: ActivitySeed): MockActivityRecord {
  const createdAt = new Date(Date.now() - seed.hoursAgo * 3_600_000).toISOString();
  return {
    activityId: mockId("4", seed.n),
    content: seed.content,
    province: seed.province,
    userId: seed.userId ?? null,
    orgId: seed.orgId ?? null,
    eventId: seed.eventId ?? null,
    tags: [...seed.tags],
    media: ordered(seed.media),
    likeCount: seed.likes,
    commentCount: seed.comments,
    // The last seed is an unpublished draft so profile tabs can show it.
    isPublished: seed.n !== 17,
    createdAt,
    updatedAt: null,
  };
}

/** Mutable in-memory store, newest first. */
export const mockActivities: MockActivityRecord[] = seeds
  .map(fromSeed)
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const MOCK_ACTIVITY_IDS = {
  sunrisePost: mockId("4", 1),
  bonfireAnnouncement: mockId("4", 2),
  boatRaceVideo: mockId("4", 3),
  balletVideo: mockId("4", 8),
} as const;

// ── Per-viewer flags ─────────────────────────────────────────

type ActivityFlag = "liked" | "saved";

const activityFlags: Record<ActivityFlag, Map<string, Set<string>>> = {
  liked: new Map([[MOCK_USER_IDS.sokha, new Set<string>([mockId("4", 2), mockId("4", 4)])]]),
  saved: new Map([[MOCK_USER_IDS.sokha, new Set<string>([mockId("4", 3), mockId("4", 5)])]]),
};

export function hasActivityFlag(flag: ActivityFlag, actorId: string | null | undefined, activityId: string): boolean {
  if (!actorId) return false;
  return activityFlags[flag].get(actorId)?.has(activityId) ?? false;
}

export function toggleActivityFlag(flag: ActivityFlag, actorId: string, activityId: string): boolean {
  const set = activityFlags[flag].get(actorId) ?? new Set<string>();
  activityFlags[flag].set(actorId, set);
  if (set.has(activityId)) {
    set.delete(activityId);
    return false;
  }
  set.add(activityId);
  return true;
}

export function activityIdsWithFlag(flag: ActivityFlag, actorId: string | null | undefined): string[] {
  if (!actorId) return [];
  return [...(activityFlags[flag].get(actorId) ?? [])];
}

// ── Lookups & projections ────────────────────────────────────

export function findMockActivity(activityId: string): MockActivityRecord | undefined {
  return mockActivities.find((a) => a.activityId === activityId);
}

export function publishedActivities(): MockActivityRecord[] {
  return mockActivities.filter((a) => a.isPublished);
}

/** RawActivityItem as returned by the feed/detail endpoints, for a given viewer. */
export function toRawActivityItem(a: MockActivityRecord, actorId?: string | null): RawActivityItem {
  const author = a.orgId ? findMockOrganization(a.orgId) : findMockAccount(a.userId);
  const event = a.eventId ? findMockEvent(a.eventId) : undefined;
  return {
    activityId: a.activityId,
    commentCount: a.commentCount,
    content: a.content,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    event: event
      ? {
          eventId: event.eventId,
          eventName: event.title,
          cover: event.cover,
          startAt: event.startAt,
          endAt: event.endAt,
          address: { ...event.address },
        }
      : null,
    isLiked: hasActivityFlag("liked", actorId, a.activityId),
    isSaved: hasActivityFlag("saved", actorId, a.activityId),
    likeCount: a.likeCount,
    media: a.media.map((m) => ({ ...m })),
    orgId: a.orgId,
    ownerAvatar: author ? ("logo" in author ? author.logo : author.avatar) : null,
    ownerName: author ? ("name" in author ? author.name : author.fullName) : null,
    province: a.province,
    tags: a.tags.map((t) => ({ ...t })),
    userId: a.orgId ? null : a.userId,
  };
}
