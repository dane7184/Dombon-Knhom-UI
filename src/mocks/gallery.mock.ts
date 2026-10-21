// Mirrors GET /activities/gallery → RawGalleryItem[] (one tile per published
// activity, previewing its first media item). Derived from activities.mock.ts
// so gallery tiles link to posts that actually exist.

import type { RawGalleryItem } from "@/types/activity.type";
import { publishedActivities, type MockActivityRecord } from "@/mocks/activities.mock";

export function toRawGalleryItem(a: MockActivityRecord): RawGalleryItem | null {
  const preview = a.media[0];
  if (!preview) return null;
  return {
    activityId: a.activityId,
    mediaId: preview.actMediaId,
    previewUrl: preview.fileUrl,
    mediaType: preview.type,
    hasMore: a.media.length > 1,
    createdAt: a.createdAt,
    durations: preview.type === "Video" ? preview.durationSeconds : null,
  };
}

/** Gallery items, newest first. */
export function mockGalleryItems(): RawGalleryItem[] {
  return publishedActivities()
    .map(toRawGalleryItem)
    .filter((item): item is RawGalleryItem => item !== null);
}
