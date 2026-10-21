"use server";

// Selects the real or mock trending-tags service. This is a server-action
// module, so it exports an explicit async function instead of re-exporting.

import { USE_MOCK_DATA } from "@/config/data-source";
import * as api from "@/services/api/tagService";
import * as mock from "@/services/mock/tagService";
import type { TrendingTagsResponse } from "@/types/trendy-tag.type";

const service: typeof api = USE_MOCK_DATA ? mock : api;

export async function fetchTrendingTags(limit = 10): Promise<TrendingTagsResponse> {
  return service.fetchTrendingTags(limit);
}
