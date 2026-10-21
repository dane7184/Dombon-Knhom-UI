"use client";

import { Suspense } from "react";
import FilterPanel from "@/components/home/FilterPanel";
import { Category } from "@/services/category.service";

interface Props {
  categories: Category[];
}

// Suspense required because FilterPanel uses useSearchParams
export default function FilterPanelWrapper({ categories }: Props) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full bg-white rounded-xl border border-gray-100 animate-pulse" />
      }
    >
      <FilterPanel categories={categories} />
    </Suspense>
  );
}
