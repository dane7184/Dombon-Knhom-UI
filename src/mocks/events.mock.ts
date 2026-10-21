// Canonical mock events. The backend exposes several projections of the same
// event (map list, detail, organizer management, top 5, …); each projection
// below is derived from these records so every screen shows consistent data.

import type {
  ApiAgenda,
  ApiEventDetail,
  ApiMapEvent,
  UpcomingEventResponse,
} from "@/types/event.type";
import type { EventManagement, EventManagementDetails } from "@/types/organizer.type";
import { MOCK_IMAGES } from "@/mocks/assets";
import { mockCategoryId, type MockCategoryName } from "@/mocks/categories.mock";
import { MOCK_ORG_IDS, MOCK_USER_IDS } from "@/mocks/ids";
import { isoFromNow, mockId } from "@/mocks/utils";

export type MockModerationStatus = "Pending" | "Approved" | "Rejected";

export interface MockEventRecord {
  eventId: string;
  title: string;
  description: string;
  categoryName: MockCategoryName;
  categoryId: string;
  cover: string;
  province: string;
  address: { district: string; commune: string; specificAddr: string };
  latitude: number;
  longitude: number;
  price: number;
  capacity: number | null;
  startAt: string;
  endAt: string;
  status: MockModerationStatus;
  rejectedReason: string | null;
  reviewedAt: string | null;
  /** Owning organization (org-created events). */
  orgId: string | null;
  /** Creator for user-created events; null for org events. */
  userId: string | null;
  likeCount: number;
  commentCount: number;
  ratingCount: number;
  reportCount: number;
  averageRating: number;
  attendeeCount: number;
  agenda: ApiAgenda;
  createdAt: string;
}

interface EventSeed {
  n: number;
  title: string;
  description: string;
  category: MockCategoryName;
  cover: string;
  province: string;
  address: MockEventRecord["address"];
  lat: number;
  lng: number;
  price: number;
  capacity: number | null;
  /** Days from today; negative = past. */
  startInDays: number;
  durationDays: number;
  status?: MockModerationStatus;
  rejectedReason?: string;
  orgId?: string;
  userId?: string;
  likes: number;
  comments: number;
  ratings: number;
  reports?: number;
  rating: number;
  attendees: number;
  createdDaysAgo: number;
}

function buildAgenda(startAt: string, durationDays: number, title: string): ApiAgenda {
  const agenda: ApiAgenda = {};
  const start = new Date(startAt);
  for (let day = 0; day < Math.min(durationDays, 2); day++) {
    const date = new Date(start);
    date.setDate(start.getDate() + day);
    const key = date.toISOString().slice(0, 10);
    agenda[key] = [
      {
        order: 1,
        startTime: "09:00",
        endTime: "10:30",
        speakerName: day === 0 ? "Dara Kim" : "Chenda Ouk",
        description: day === 0 ? `Opening of ${title}` : "Guided experience and workshops",
      },
      {
        order: 2,
        startTime: "11:00",
        endTime: "12:30",
        speakerName: "Sreypov Heng",
        description: "Community showcase",
      },
      {
        order: 3,
        startTime: "17:00",
        endTime: "20:00",
        speakerName: "Local artists",
        description: "Evening performances",
      },
    ];
  }
  return agenda;
}

const seeds: EventSeed[] = [
  // ── Angkor Events Collective (Dara's organization) ──────────
  {
    n: 1,
    title: "Angkor Wat Sunrise Walk",
    description:
      "A guided pre-dawn walk to watch the sunrise over Angkor Wat, followed by a traditional Khmer breakfast with local guides.",
    category: "Cultural",
    cover: MOCK_IMAGES.angkorSunrise,
    province: "Siem_Reap",
    address: { district: "Siem Reap", commune: "Nokor Thum", specificAddr: "Angkor Wat west causeway" },
    lat: 13.4125,
    lng: 103.867,
    price: 15,
    capacity: 120,
    startInDays: 6,
    durationDays: 1,
    orgId: MOCK_ORG_IDS.angkor,
    likes: 342,
    comments: 6,
    ratings: 0,
    rating: 0,
    attendees: 87,
    createdDaysAgo: 21,
  },
  {
    n: 2,
    title: "Angkor Cultural Bonfire Night",
    description:
      "An evening of apsara dance, traditional music and storytelling around a bonfire near the temples.",
    category: "Traditional",
    cover: MOCK_IMAGES.bonfireNight,
    province: "Siem_Reap",
    address: { district: "Siem Reap", commune: "Kouk Chak", specificAddr: "Angkor Cultural Field" },
    lat: 13.3671,
    lng: 103.8448,
    price: 25,
    capacity: 300,
    startInDays: 14,
    durationDays: 1,
    orgId: MOCK_ORG_IDS.angkor,
    likes: 518,
    comments: 4,
    ratings: 0,
    rating: 0,
    attendees: 164,
    createdDaysAgo: 30,
  },
  {
    n: 3,
    title: "Bon Om Touk Water Festival Boat Race",
    description:
      "Cheer on dragon boat teams during the Water Festival with riverside food stalls and night illuminations.",
    category: "Traditional",
    cover: MOCK_IMAGES.waterFestival,
    province: "Phnom_Penh",
    address: { district: "Daun Penh", commune: "Chey Chumneah", specificAddr: "Sisowath Quay" },
    lat: 11.5696,
    lng: 104.9312,
    price: 0,
    capacity: null,
    // Started yesterday and runs three days, so it shows as "in progress".
    startInDays: -1,
    durationDays: 3,
    orgId: MOCK_ORG_IDS.angkor,
    likes: 1204,
    comments: 3,
    ratings: 0,
    rating: 0,
    attendees: 0,
    createdDaysAgo: 12,
  },
  {
    n: 4,
    title: "Siem Reap Night Art Market",
    description: "Local painters, sculptors and silk weavers open their studios for a night market along the river.",
    category: "Art",
    cover: MOCK_IMAGES.art,
    province: "Siem_Reap",
    address: { district: "Siem Reap", commune: "Svay Dangkum", specificAddr: "Old Market riverside" },
    lat: 13.3546,
    lng: 103.8551,
    price: 5,
    capacity: 200,
    startInDays: -18,
    durationDays: 1,
    orgId: MOCK_ORG_IDS.angkor,
    likes: 276,
    comments: 2,
    ratings: 24,
    rating: 4.6,
    attendees: 182,
    createdDaysAgo: 60,
  },
  {
    n: 5,
    title: "Khmer New Year Street Celebration",
    description: "Traditional games, water blessings and live bands to celebrate Choul Chnam Thmey.",
    category: "Traditional",
    cover: MOCK_IMAGES.topEventCard,
    province: "Siem_Reap",
    address: { district: "Siem Reap", commune: "Sala Kamreuk", specificAddr: "Pub Street" },
    lat: 13.3549,
    lng: 103.8553,
    price: 0,
    capacity: null,
    startInDays: -190,
    durationDays: 3,
    orgId: MOCK_ORG_IDS.angkor,
    likes: 2310,
    comments: 2,
    ratings: 88,
    rating: 4.8,
    attendees: 940,
    createdDaysAgo: 220,
  },
  {
    n: 6,
    title: "Temple Photography Workshop",
    description: "Hands-on workshop on composition and golden-hour light at Ta Prohm with a professional photographer.",
    category: "Education",
    cover: MOCK_IMAGES.eventCard,
    province: "Siem_Reap",
    address: { district: "Siem Reap", commune: "Nokor Thum", specificAddr: "Ta Prohm entrance" },
    lat: 13.4349,
    lng: 103.8891,
    price: 35,
    capacity: 25,
    startInDays: 30,
    durationDays: 1,
    status: "Pending",
    orgId: MOCK_ORG_IDS.angkor,
    likes: 41,
    comments: 0,
    ratings: 0,
    rating: 0,
    attendees: 0,
    createdDaysAgo: 2,
  },
  {
    n: 7,
    title: "Late Night Rave at the Ruins",
    description: "An all-night electronic music party proposed near a heritage site.",
    category: "Music",
    cover: MOCK_IMAGES.edmFestival,
    province: "Siem_Reap",
    address: { district: "Siem Reap", commune: "Kouk Chak", specificAddr: "Near Banteay Kdei" },
    lat: 13.4319,
    lng: 103.8996,
    price: 20,
    capacity: 500,
    startInDays: 40,
    durationDays: 1,
    status: "Rejected",
    rejectedReason: "Events with amplified music are not permitted inside the Angkor heritage zone.",
    orgId: MOCK_ORG_IDS.angkor,
    likes: 0,
    comments: 0,
    ratings: 0,
    reports: 2,
    rating: 0,
    attendees: 0,
    createdDaysAgo: 5,
  },
  {
    n: 8,
    title: "Royal Ballet Evening Performance",
    description: "A seated performance of the Royal Ballet of Cambodia with live pinpeat orchestra.",
    category: "Cultural",
    cover: MOCK_IMAGES.musicEvent,
    province: "Siem_Reap",
    address: { district: "Siem Reap", commune: "Sla Kram", specificAddr: "Angkor Village Theatre" },
    lat: 13.3667,
    lng: 103.8604,
    price: 18,
    capacity: 150,
    startInDays: -75,
    durationDays: 1,
    orgId: MOCK_ORG_IDS.angkor,
    likes: 389,
    comments: 1,
    ratings: 41,
    rating: 4.4,
    attendees: 148,
    createdDaysAgo: 110,
  },

  // ── Mekong Food Lovers ──────────────────────────────────────
  {
    n: 9,
    title: "Khmer Food Expo 2026",
    description: "Taste regional dishes from all 25 provinces, cooking demos and a kampot pepper market.",
    category: "Food",
    cover: MOCK_IMAGES.khmerFoodExpo,
    province: "Phnom_Penh",
    address: { district: "Chamkar Mon", commune: "Tonle Bassac", specificAddr: "Koh Pich Exhibition Center" },
    lat: 11.5488,
    lng: 104.9393,
    price: 3,
    capacity: 2000,
    startInDays: 9,
    durationDays: 2,
    orgId: MOCK_ORG_IDS.mekong,
    likes: 864,
    comments: 2,
    ratings: 0,
    rating: 0,
    attendees: 512,
    createdDaysAgo: 25,
  },
  {
    n: 10,
    title: "Kampot Riverside Street Food Night",
    description: "Crab, pepper and durian specialties from Kampot and Kep vendors along the river.",
    category: "Food",
    cover: MOCK_IMAGES.foodFestival,
    province: "Kampot",
    address: { district: "Kampot", commune: "Kampong Bay", specificAddr: "Riverside Road" },
    lat: 10.6104,
    lng: 104.1815,
    price: 0,
    capacity: null,
    startInDays: 3,
    durationDays: 1,
    orgId: MOCK_ORG_IDS.mekong,
    likes: 233,
    comments: 0,
    ratings: 0,
    rating: 0,
    attendees: 0,
    createdDaysAgo: 8,
  },

  // ── Phnom Penh Tech Hub ─────────────────────────────────────
  {
    n: 11,
    title: "Phnom Penh Tech Summit 2026",
    description: "Talks on AI, fintech and startups in Cambodia with workshops and a hiring fair.",
    category: "Technology",
    cover: MOCK_IMAGES.techSummit,
    province: "Phnom_Penh",
    address: { district: "Chamkar Mon", commune: "Boeung Keng Kang I", specificAddr: "Raffles Convention Hall" },
    lat: 11.5527,
    lng: 104.9282,
    price: 10,
    capacity: 800,
    startInDays: 18,
    durationDays: 2,
    orgId: MOCK_ORG_IDS.techHub,
    likes: 615,
    comments: 1,
    ratings: 0,
    rating: 0,
    attendees: 430,
    createdDaysAgo: 40,
  },

  // ── User-created events ─────────────────────────────────────
  {
    n: 12,
    title: "Battambang Bamboo Train Ride Meetup",
    description: "A casual group ride on the bamboo train followed by lunch in the countryside.",
    category: "Adventure",
    cover: MOCK_IMAGES.eventFeedback,
    province: "Battambang",
    address: { district: "Battambang", commune: "Ou Mal", specificAddr: "O Dambong bamboo train station" },
    lat: 13.0957,
    lng: 103.2022,
    price: 0,
    capacity: 30,
    startInDays: 11,
    durationDays: 1,
    userId: MOCK_USER_IDS.sokha,
    likes: 58,
    comments: 0,
    ratings: 0,
    rating: 0,
    attendees: 12,
    createdDaysAgo: 6,
  },
  {
    n: 13,
    title: "Koh Pich Sunset Volleyball",
    description: "Friendly beach-style volleyball games for all levels. Bring water and sunscreen.",
    category: "Sport",
    cover: MOCK_IMAGES.waterFestivalAlt,
    province: "Phnom_Penh",
    address: { district: "Chamkar Mon", commune: "Tonle Bassac", specificAddr: "Koh Pich sports court" },
    lat: 11.5445,
    lng: 104.9375,
    price: 0,
    capacity: 24,
    startInDays: 4,
    durationDays: 1,
    status: "Pending",
    userId: MOCK_USER_IDS.sokha,
    likes: 7,
    comments: 0,
    ratings: 0,
    rating: 0,
    attendees: 0,
    createdDaysAgo: 1,
  },
  {
    n: 14,
    title: "Kep Crab Market Charity Run",
    description: "A 5K fun run along the Kep coast raising funds for local schools.",
    category: "Charity",
    cover: MOCK_IMAGES.locationImage,
    province: "Kep",
    address: { district: "Kep", commune: "Prey Thom", specificAddr: "Kep Crab Market" },
    lat: 10.4829,
    lng: 104.3167,
    price: 5,
    capacity: 400,
    startInDays: -40,
    durationDays: 1,
    userId: MOCK_USER_IDS.bora,
    likes: 144,
    comments: 0,
    ratings: 17,
    rating: 4.2,
    attendees: 260,
    createdDaysAgo: 80,
  },
];

function fromSeed(seed: EventSeed): MockEventRecord {
  const startAt = isoFromNow(seed.startInDays, 8);
  const endAt = isoFromNow(seed.startInDays + seed.durationDays - 1, 20);
  const status = seed.status ?? "Approved";
  return {
    eventId: mockId("3", seed.n),
    title: seed.title,
    description: seed.description,
    categoryName: seed.category,
    categoryId: mockCategoryId(seed.category),
    cover: seed.cover,
    province: seed.province,
    address: seed.address,
    latitude: seed.lat,
    longitude: seed.lng,
    price: seed.price,
    capacity: seed.capacity,
    startAt,
    endAt,
    status,
    rejectedReason: seed.rejectedReason ?? null,
    reviewedAt: status === "Pending" ? null : isoFromNow(-seed.createdDaysAgo + 1, 14),
    orgId: seed.orgId ?? null,
    userId: seed.userId ?? null,
    likeCount: seed.likes,
    commentCount: seed.comments,
    ratingCount: seed.ratings,
    reportCount: seed.reports ?? 0,
    averageRating: seed.rating,
    attendeeCount: seed.attendees,
    agenda: buildAgenda(startAt, seed.durationDays, seed.title),
    createdAt: isoFromNow(-seed.createdDaysAgo, 10),
  };
}

/** Mutable in-memory store. Writes from mock services change it until reload. */
export const mockEvents: MockEventRecord[] = seeds.map(fromSeed);

export const MOCK_EVENT_IDS = {
  angkorSunrise: mockId("3", 1),
  bonfireNight: mockId("3", 2),
  waterFestival: mockId("3", 3),
  artMarket: mockId("3", 4),
  khmerNewYear: mockId("3", 5),
  photoWorkshop: mockId("3", 6),
  rejectedRave: mockId("3", 7),
  royalBallet: mockId("3", 8),
  foodExpo: mockId("3", 9),
  kampotStreetFood: mockId("3", 10),
  techSummit: mockId("3", 11),
  bambooTrain: mockId("3", 12),
  volleyball: mockId("3", 13),
  charityRun: mockId("3", 14),
} as const;

// ── Per-viewer flags (liked / saved / joined) ────────────────

type ViewerFlag = "liked" | "saved" | "joined";

const viewerFlags: Record<ViewerFlag, Map<string, Set<string>>> = {
  liked: new Map([[MOCK_USER_IDS.sokha, new Set<string>([mockId("3", 1), mockId("3", 9), mockId("3", 4)])]]),
  saved: new Map([[MOCK_USER_IDS.sokha, new Set<string>([mockId("3", 2), mockId("3", 11)])]]),
  joined: new Map([[MOCK_USER_IDS.sokha, new Set<string>([mockId("3", 4), mockId("3", 8), mockId("3", 9)])]]),
};

export function hasEventFlag(flag: ViewerFlag, actorId: string | null | undefined, eventId: string): boolean {
  if (!actorId) return false;
  return viewerFlags[flag].get(actorId)?.has(eventId) ?? false;
}

/** Flips a flag and returns the new state. */
export function toggleEventFlag(flag: ViewerFlag, actorId: string, eventId: string): boolean {
  const set = viewerFlags[flag].get(actorId) ?? new Set<string>();
  viewerFlags[flag].set(actorId, set);
  if (set.has(eventId)) {
    set.delete(eventId);
    return false;
  }
  set.add(eventId);
  return true;
}

export function eventIdsWithFlag(flag: ViewerFlag, actorId: string | null | undefined): string[] {
  if (!actorId) return [];
  return [...(viewerFlags[flag].get(actorId) ?? [])];
}

// ── Lookups ──────────────────────────────────────────────────

export function findMockEvent(eventId: string): MockEventRecord | undefined {
  return mockEvents.find((e) => e.eventId === eventId);
}

export function isPublicEvent(e: MockEventRecord): boolean {
  return e.status === "Approved";
}

export function eventsOfOrganization(orgId: string): MockEventRecord[] {
  return mockEvents
    .filter((e) => e.orgId === orgId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ── Projections to API response shapes ───────────────────────

export function toApiMapEvent(e: MockEventRecord, actorId?: string | null): ApiMapEvent {
  return {
    eventId: e.eventId,
    title: e.title,
    description: e.description,
    categoryName: e.categoryName,
    image: e.cover,
    latitude: e.latitude,
    longitude: e.longitude,
    price: e.price,
    rating: e.averageRating,
    isLiked: hasEventFlag("liked", actorId, e.eventId),
    isSaved: hasEventFlag("saved", actorId, e.eventId),
    startAt: e.startAt,
    endAt: e.endAt,
    isJoined: hasEventFlag("joined", actorId, e.eventId),
    location: {
      province: e.province,
      district: e.address.district,
      commune: e.address.commune,
      specificAddr: e.address.specificAddr,
    },
    province: e.province,
  };
}

export function toApiEventDetail(e: MockEventRecord, actorId?: string | null): ApiEventDetail {
  const isPast = new Date(e.endAt).getTime() < Date.now();
  return {
    eventId: e.eventId,
    title: e.title,
    description: e.description,
    province: e.province,
    address: { ...e.address },
    cover: e.cover,
    agenda: structuredClone(e.agenda),
    latitude: e.latitude,
    longitude: e.longitude,
    status: e.status === "Approved" ? (isPast ? "Completed" : "Published") : "Draft",
    price: e.price,
    capacity: e.capacity,
    startAt: e.startAt,
    endAt: e.endAt,
    orgId: e.orgId,
    userId: e.userId,
    categoryId: e.categoryId,
    likeCount: e.likeCount,
    commentCount: e.commentCount,
    ratingCount: e.ratingCount,
    reportCount: e.reportCount,
    isSaved: hasEventFlag("saved", actorId, e.eventId),
    isLiked: hasEventFlag("liked", actorId, e.eventId),
    isJoined: hasEventFlag("joined", actorId, e.eventId),
    joined: e.attendeeCount,
    ratings: [],
    ratingSummary: null,
  };
}

/** GET /organizations/{orgId}/events item. */
export function toEventManagement(e: MockEventRecord): EventManagement {
  return {
    categoryName: e.categoryName,
    description: e.description,
    endAt: e.endAt,
    eventId: e.eventId,
    image: e.cover,
    isLiked: false,
    isSaved: false,
    latitude: String(e.latitude),
    location: [e.address.specificAddr, e.address.commune, e.address.district].filter(Boolean).join(", "),
    longitude: String(e.longitude),
    price: e.price,
    province: e.province,
    rating: e.averageRating,
    startAt: e.startAt,
    title: e.title,
  };
}

/** GET /organizations/{orgId}/events/top item. */
export function toEventManagementDetails(e: MockEventRecord): EventManagementDetails {
  return {
    eventId: e.eventId,
    title: e.title,
    address: { ...e.address },
    description: e.description,
    cover: e.cover,
    agenda: { additionalProperty: Object.values(e.agenda)[0] ?? [] },
    latitude: e.latitude,
    longitude: e.longitude,
    province: e.province,
    status: e.status,
    price: e.price,
    capacity: e.capacity ?? 0,
    startAt: e.startAt,
    endAt: e.endAt,
    rejectedReason: e.rejectedReason ?? "",
    reviewedAt: e.reviewedAt ?? "",
    orgId: e.orgId ?? "",
    userId: e.userId ?? "",
    categoryId: e.categoryId,
    categoryName: e.categoryName,
    likeCount: e.likeCount,
    commentCount: e.commentCount,
    ratingCount: e.ratingCount,
    reportCount: e.reportCount,
  };
}

/** POST /events/map item. */
export function toUpcomingEventResponse(e: MockEventRecord, actorId?: string | null): UpcomingEventResponse {
  return {
    categoryName: e.categoryName,
    description: e.description,
    endAt: e.endAt,
    eventId: e.eventId,
    image: e.cover,
    isLiked: hasEventFlag("liked", actorId, e.eventId),
    isSaved: hasEventFlag("saved", actorId, e.eventId),
    latitude: e.latitude,
    location: { province: e.province, district: e.address.district, commune: e.address.commune },
    longitude: e.longitude,
    price: e.price,
    province: e.province,
    rating: e.averageRating,
    startAt: e.startAt,
    title: e.title,
  };
}
