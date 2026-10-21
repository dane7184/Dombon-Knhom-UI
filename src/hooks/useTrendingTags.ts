"use client";

import {useQuery} from "@tanstack/react-query";
import {fetchTrendingTags} from "@/services/tagService";

export function useTrendingTags(limit = 10) {
    return useQuery({
        queryKey: ["tags", "trending", limit],
        queryFn: () => fetchTrendingTags(limit),
        select: (res) => res.data,
    });
}
