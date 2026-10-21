// Mock implementation of services/api/tagService.ts.
// Trending tags = tag usage counted across published mock activities.

import type { TagData, TrendingTagsResponse } from "@/types/trendy-tag.type";
import { publishedActivities } from "@/mocks/activities.mock";
import { mockRequest } from "@/mocks/utils";

export const fetchTrendingTags = async (limit = 10): Promise<TrendingTagsResponse> => {
  await mockRequest("tag.trending");
  const usage = new Map<string, TagData>();
  for (const activity of publishedActivities()) {
    for (const tag of activity.tags) {
      const entry = usage.get(tag.tagId) ?? { tagId: tag.tagId, name: tag.name, usageCount: 0 };
      entry.usageCount += 1;
      usage.set(tag.tagId, entry);
    }
  }
  const data = [...usage.values()]
    .sort((a, b) => b.usageCount - a.usageCount || a.name.localeCompare(b.name))
    .slice(0, limit);
  return { success: true, message: "Trending tags fetched successfully", data };
};
