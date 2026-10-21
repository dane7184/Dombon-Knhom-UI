"use client";

import { ArrowDown2, Calendar, CloseCircle } from "iconsax-react";
import { useEffect, useRef, useState } from "react";
import { CATEGORY_CONFIG } from "@/constant/category.config";
import { MapFilterState } from "@/hooks/useMapFilter";
import { useCategories } from "@/hooks/useCategories";

interface FilterBarProps {
  filter: MapFilterState;
  onChange: (patch: Partial<MapFilterState>) => void;
}

export default function FilterBar({ filter, onChange }: FilterBarProps) {
  const [catOpen, setCatOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { categories, loading: catLoading } = useCategories();

  const toggleCategoryId = (id: string) => {
    const next = filter.categoryIds.includes(id)
      ? filter.categoryIds.filter((c) => c !== id)
      : [...filter.categoryIds, id];
    onChange({ categoryIds: next });
  };

  const removeCategoryId = (id: string) => {
    onChange({ categoryIds: filter.categoryIds.filter((c) => c !== id) });
  };

  const handleClear = () => {
    onChange({ categoryIds: [], dateRange: "all", from: null, to: null });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setCatOpen(false);
      }
    }
    if (catOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [catOpen]);

  return (
    // Mobile: raised above the floating bottom bar; lg+: original centered bar
    <div className="absolute bottom-26 left-1/2 -translate-x-1/2 z-1000 w-full max-w-4xl px-4 lg:bottom-8">
      <div className="bg-(--background-white) rounded-xl border border-(--input-border) p-3 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-0 justify-between card-shadow">
        {/* ── Category ── */}
        <div
          ref={dropdownRef}
          className="w-full lg:w-0 lg:flex-[1.5] lg:p-3 relative min-w-0"
        >
          <label className="block text-sm font-bold text-(--secondary-color) tracking-wide mb-2 pl-1">
            Categories
          </label>
          <div
            onClick={() => setCatOpen((v) => !v)}
            className={`flex items-center justify-between gap-2 px-3 py-2.5 border rounded-lg bg-(--background-white) cursor-pointer transition-all h-10 ${catOpen ? "border-(--main-color) ring-2 ring-cyan-100/50" : "border-(--input-border)"}`}
          >
            <div className="flex items-center gap-1.5 overflow-hidden min-w-0 flex-1">
              {filter.categoryIds.length === 0 ? (
                <span className="text-sm text-slate-400 select-none font-inter truncate">
                  Select Categories
                </span>
              ) : (
                <div className="flex items-center gap-1.5 overflow-hidden min-w-0 flex-1 whitespace-nowrap">
                  {filter.categoryIds.slice(0, 2).map((id) => {
                    const cat = categories.find((c) => c.id === id);
                    const configKey = cat ? cat.configKey : "Other";
                    const config = CATEGORY_CONFIG[configKey];
                    return (
                      <span
                        key={id}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium border shrink-0 font-inter"
                        style={{
                          background: config.bg,
                          borderColor: config.color,
                          color: config.color,
                        }}
                      >
                        {cat?.name ?? id}
                        <button
                          onClick={() => removeCategoryId(id)}
                          className="ml-0.5 hover:opacity-80"
                        >
                          <CloseCircle
                            size={12}
                            color={config.color}
                            variant="Bold"
                          />
                        </button>
                      </span>
                    );
                  })}
                  {filter.categoryIds.length > 2 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 shrink-0 font-inter">
                      +{filter.categoryIds.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
            <ArrowDown2
              size={16}
              className={`text-slate-400 transition-transform duration-200 shrink-0 ${catOpen ? "rotate-180 text-(--main-color)" : ""}`}
            />
          </div>

          {/* Dropdown: opens upward on both mobile and desktop */}
          {catOpen && (
            <div className="absolute left-0 right-0 bottom-full mb-2 bg-(--background-white) border border-(--input-border) rounded-xl shadow-2xl z-50 p-1.5 flex flex-col gap-0.5 overflow-y-auto h-60">
              {catLoading ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  Loading...
                </p>
              ) : (
                categories.map((cat) => {
                  const config = CATEGORY_CONFIG[cat.configKey];
                  const IconComponent = config.icon;
                  const selected = filter.categoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategoryId(cat.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left w-full cursor-pointer font-inter ${selected ? "bg-cyan-50/60 text-(--main-color) font-semibold" : "hover:bg-(--background-gray) text-(--text-secondary)"}`}
                    >
                      <IconComponent
                        size={16}
                        color={selected ? "var(--main-color)" : config.color}
                      />
                      {cat.name}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Divider: only visible on lg+ between category and from */}
        <div className="hidden lg:block w-px bg-(--input-border) self-stretch my-2" />

        {/* ── From + To: side by side on mobile, individual flex slots on lg+ ── */}
        <div className="flex flex-row gap-3 lg:contents">
          {/* ── From ── */}
          <div className="flex-1 lg:w-0 lg:flex-1 lg:p-3 min-w-0">
            <label className="block text-sm font-bold text-(--secondary-color) tracking-wide mb-2 pl-1">
              From
            </label>
            <div
              className={`relative flex items-center gap-2 px-3 border rounded-lg h-10 transition-all ${filter.dateRange !== "all" ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200" : "bg-white border-gray-200 hover:border-cyan-500 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100/50"}`}
            >
              <span className="shrink-0 pointer-events-none z-10">
                <Calendar size={16} color="#94a3b8" variant="Linear" />
              </span>
              <input
                type="date"
                disabled={filter.dateRange !== "all"}
                value={filter.from ?? ""}
                onChange={(e) => onChange({ from: e.target.value || null })}
                className="flex-1 min-w-0 text-sm text-slate-600 bg-transparent disabled:cursor-not-allowed focus:outline-none font-inter cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0"
              />
              {filter.from && filter.dateRange === "all" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({ from: null });
                  }}
                  className="shrink-0 text-slate-400 hover:text-foreground cursor-pointer z-10 relative"
                >
                  <CloseCircle size={14} variant="Bold" />
                </button>
              )}
            </div>
          </div>

          {/* ── To ── */}
          <div className="flex-1 lg:w-0 lg:flex-1 min-w-0">
            <label className="block text-sm font-bold text-slate-800 tracking-wide mb-2 pl-1">
              To
            </label>
            <div
              className={`relative flex items-center gap-2 px-3 border rounded-lg h-10 transition-all ${filter.dateRange !== "all" ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200" : "bg-white border-gray-200 hover:border-cyan-500 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100/50"}`}
            >
              <span className="shrink-0 pointer-events-none z-10">
                <Calendar size={16} color="#94a3b8" variant="Linear" />
              </span>
              <input
                type="date"
                disabled={filter.dateRange !== "all"}
                value={filter.to ?? ""}
                min={filter.from ?? undefined}
                onChange={(e) => onChange({ to: e.target.value || null })}
                className="flex-1 min-w-0 text-sm text-slate-600 bg-transparent disabled:cursor-not-allowed focus:outline-none font-inter cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0"
              />
              {filter.to && filter.dateRange === "all" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({ to: null });
                  }}
                  className="shrink-0 text-slate-400 hover:text-slate-600 cursor-pointer z-10 relative"
                >
                  <CloseCircle size={14} variant="Bold" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Clear ── */}
        {/* Mobile: full width button at the bottom; lg+: original auto-width on the right */}
        <div className="px-0 lg:px-3 flex items-center justify-end lg:pt-6">
          <button
            onClick={handleClear}
            className="w-full lg:w-auto px-6 py-2 bg-(--main-color) text-(--btn-text) text-sm font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-poppins"
          >
            <CloseCircle size={16} color="var(--btn-text)" variant="Linear" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
