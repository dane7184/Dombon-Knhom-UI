"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { DateRangeFilter } from "@/services/event.service";

export interface MapFilterState {
  search: string;
  categoryIds: string[];
  dateRange: DateRangeFilter;
  from: string | null;
  to: string | null;
  province: string | null;
  district: string | null;
  commune: string | null;
}

export function useMapFilter(): [
  MapFilterState,
  (patch: Partial<MapFilterState>) => void,
] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state: MapFilterState = {
    search: searchParams.get("q") ?? "",
    categoryIds: searchParams.get("cat")
      ? searchParams.get("cat")!.split(",").filter(Boolean)
      : [],
    dateRange: (searchParams.get("range") as DateRangeFilter) ?? "all",
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    province: searchParams.get("province"),
    district: searchParams.get("district"),
    commune: searchParams.get("commune"),
  };

  const setFilter = useCallback(
    (patch: Partial<MapFilterState>) => {
      const next = { ...state, ...patch };
      const params = new URLSearchParams();

      if (next.search) params.set("q", next.search);
      if (next.categoryIds.length > 0)
        params.set("cat", next.categoryIds.join(","));
      if (next.dateRange !== "all") params.set("range", next.dateRange);
      // Only preserve from/to when dateRange is "all"
      if (next.dateRange === "all") {
        if (next.from) params.set("from", next.from);
        if (next.to) params.set("to", next.to);
      }
      if (next.province) params.set("province", next.province);
      if (next.district) params.set("district", next.district);
      if (next.commune) params.set("commune", next.commune);

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [state, router, pathname],
  );

  return [state, setFilter];
}
