// Local media under /public used by mock data. Every path here was checked to
// exist in the repository — mock data must not point at external hosts or the
// real backend.

export const MOCK_IMAGES = {
  angkorSunrise: "/images/angkor_wat_sunrise.png",
  edmFestival: "/images/edm_festival.png",
  foodFestival: "/images/foodFestival.jpg",
  khmerFoodExpo: "/images/khmer_food_expo.png",
  musicEvent: "/images/musicEvent.jpg",
  waterFestival: "/images/water_festival.png",
  waterFestivalAlt: "/images/waterFestival.avif",
  art: "/images/art.avif",
  eventCard: "/images/EventCard3.jpg",
  topEventCard: "/images/Top5EventCard2.jpg",
  bonfireNight: "/images/event/Angkor Wat Cultural Bonfire Night.png",
  techSummit: "/images/event/Phnom Penh Tech Summit 2026.png",
  eventFeedback: "/images/event/Event feedback.jpg",
  locationImage: "/images/LocationImage.png",
} as const;

export const MOCK_AVATARS = {
  user: "/images/default-avatar.jpg",
  profile: "/images/default-profile.png",
  fallback: "/images/fallback-pf.png",
  organization: "/images/default-organization.jpg",
  logo: "/images/Logo.png",
} as const;

/**
 * The only video asset in the project: an iPhone recording (QuickTime .MOV,
 * HEVC/H.265, ~34 MB). Safari plays it; Chrome/Edge only where the OS provides
 * HEVC hardware decoding; Firefox does not. The gallery already shows a video
 * placeholder icon when a <video> fails to load, so unsupported browsers
 * degrade gracefully instead of breaking.
 */
export const MOCK_VIDEO = {
  url: "/images/IMG_4584.MOV",
  durationSeconds: 18,
} as const;

/** Event-style images, cycled when generating larger lists. */
export const MOCK_IMAGE_POOL: readonly string[] = [
  MOCK_IMAGES.angkorSunrise,
  MOCK_IMAGES.waterFestival,
  MOCK_IMAGES.khmerFoodExpo,
  MOCK_IMAGES.edmFestival,
  MOCK_IMAGES.musicEvent,
  MOCK_IMAGES.foodFestival,
  MOCK_IMAGES.bonfireNight,
  MOCK_IMAGES.techSummit,
  MOCK_IMAGES.art,
  MOCK_IMAGES.eventCard,
  MOCK_IMAGES.topEventCard,
  MOCK_IMAGES.waterFestivalAlt,
  MOCK_IMAGES.eventFeedback,
];

export function poolImage(index: number): string {
  return MOCK_IMAGE_POOL[index % MOCK_IMAGE_POOL.length];
}
