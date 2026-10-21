"use server";

import {TrendingTagsResponse} from "@/types/trendy-tag.type";
import {serverFetch} from "@/lib/server-fetch";

export const fetchTrendingTags = async (limit = 10): Promise<TrendingTagsResponse> => {
    const res = await serverFetch(`activities/tags/trending?limit=${limit}`);

    if (!res.ok) {
        throw new Error(`Failed to fetch tags: ${res.statusText}`);
    }

    return res.json();
};
