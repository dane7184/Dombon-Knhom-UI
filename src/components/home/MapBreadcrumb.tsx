"use client";

import { ArrowLeft } from "iconsax-react";
import { MapSelection } from "@/types/map.type";

interface MapBreadcrumbProps {
  selection: MapSelection;
  onBack: () => void;
}

export default function MapBreadcrumb({
  selection,
  onBack,
}: MapBreadcrumbProps) {
  const { province, district, commune } = selection;

  if (!province) return null;

  return (
    // Mobile: rounded-lg to match DateTabBar/MapControls, bottom-[210px] clears FilterBar
    // lg+: original bottom-10 left-4 rounded-2xl
    <div className="absolute bottom-86 left-4 lg:bottom-8 lg:left-4 z-1000 flex items-center gap-1.5 lg:gap-2 bg-white/90 backdrop-blur px-2 py-1.5 lg:px-3 lg:py-2 rounded-lg lg:rounded-2xl shadow-lg border border-(--input-border) text-sm text-slate-700 max-w-[calc(100vw-5rem)] lg:max-w-none">
      <button
        onClick={onBack}
        className="flex items-center justify-center w-8 h-8 lg:w-8 lg:h-8 rounded-lg lg:rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
      >
        <ArrowLeft
          size={14}
          color="#1c274c"
          variant="Linear"
          className="lg:hidden"
        />
        <ArrowLeft
          size={20}
          color="#1c274c"
          variant="Linear"
          className="hidden lg:block"
        />
      </button>

      <div className="flex items-center gap-1 lg:gap-1.5 text-[#1c274c] overflow-hidden text-xs lg:text-sm">
        <span
          className={`truncate ${!district ? "font-semibold text-(--secondary-color)" : ""}`}
        >
          {province}
        </span>
        {district && (
          <>
            <span className="shrink-0">/</span>
            <span
              className={`truncate ${!commune ? "font-semibold text-(--secondary-color)" : ""}`}
            >
              {district}
            </span>
          </>
        )}
        {commune && (
          <>
            <span className="shrink-0">/</span>
            <span className="font-semibold text-(--main-color) truncate">
              {commune}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
