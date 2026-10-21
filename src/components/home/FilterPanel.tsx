"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CloseCircle, ArrowDown2, Location, Calendar } from "iconsax-react";
import { CATEGORY_CONFIG } from "@/constant/category.config";
import { Category } from "@/services/category.service";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";

import districtsJson from "@/data/map/khm_admin2.json";
import communesJson from "@/data/map/khm_admin3.json";
import { CAMBODIA_PROVINCES } from "@/constant/province";
import { Province } from "@/constant/province"; // label→underscore map

interface GeoJsonFeature {
  type: string;
  properties: { adm1_name: string; adm2_name?: string; adm3_name?: string };
}
interface GeoJsonCollection {
  type: string;
  features: GeoJsonFeature[];
}

const districtsData = districtsJson as unknown as GeoJsonCollection;
const communesData = communesJson as unknown as GeoJsonCollection;

// Derive unique province names directly from GeoJSON adm1_name — used as display AND filter key
const GEO_PROVINCE_NAMES: string[] = Array.from(
  new Set(
    (districtsJson as unknown as GeoJsonCollection).features
      .map((f) => f.properties.adm1_name)
      .filter(Boolean),
  ),
).sort();

// Map from GeoJSON adm1_name → backend underscore value
// Covers the cases where adm1_name differs from the Province map key
const GEO_TO_BACKEND: Record<string, string> = {
  Mondulkiri: "Mondulkiri",
  Ratanakiri: "Ratanakiri",
  Siemreap: "Siem_Reap",
  // All others: replace spaces with underscores (covers "Phnom Penh" → "Phnom_Penh" etc.)
};

interface FilterPanelProps {
  categories: Category[];
}

export default function FilterPanel({ categories }: FilterPanelProps) {
  const { isOrgMode } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Mobile: panel collapsed by default, expanded on demand
  const [panelOpen, setPanelOpen] = useState(false);

  // ── Search (debounced — updates URL immediately) ──────────────
  const [searchText, setSearchText] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebounce(searchText, 300);

  // ── Staged state (committed only on Apply) ────────────────────
  const [stagedCategoryIds, setStagedCategoryIds] = useState<string[]>(
    searchParams.get("cat")
      ? searchParams.get("cat")!.split(",").filter(Boolean)
      : [],
  );
  // Province stored as display label (e.g. "Phnom Penh") internally so it matches
  // adm1_name in GeoJSON. URL param uses underscore value (e.g. "Phnom_Penh") for backend.
  // On init, reverse-lookup the label from the incoming URL underscore value.
  const urlProvince = searchParams.get("province");
  // URL has backend value e.g. "Phnom_Penh" → convert back to adm1_name for GeoJSON filter
  const initialProvince = urlProvince
    ? (Object.entries(GEO_TO_BACKEND).find(([, v]) => v === urlProvince)?.[0] ??
      urlProvince.replace(/_/g, " "))
    : null;
  const [stagedProvince, setStagedProvince] = useState<string | null>(
    initialProvince,
  );
  const [stagedDistrict, setStagedDistrict] = useState<string | null>(
    searchParams.get("district"),
  );
  const [stagedCommune, setStagedCommune] = useState<string | null>(
    searchParams.get("commune"),
  );
  const [stagedFrom, setStagedFrom] = useState<string | null>(
    searchParams.get("from"),
  );
  const [stagedTo, setStagedTo] = useState<string | null>(
    searchParams.get("to"),
  );

  const [openCategory, setOpenCategory] = useState(false);
  const [activeLocMenu, setActiveLocMenu] = useState<
    "province" | "district" | "commune" | null
  >(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // ── Push params to URL immediately (for resets only) ──────────
  const pushToUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(overrides).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  // ── Push debounced search to URL immediately ──────────────────
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set("q", debouncedSearch);
    else params.delete("q");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearch]);

  // ── Close dropdowns on outside click ─────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const path = e.composedPath();
      if (
        categoryDropdownRef.current &&
        !path.includes(categoryDropdownRef.current)
      ) {
        setOpenCategory(false);
      }
      if (
        locationDropdownRef.current &&
        !path.includes(locationDropdownRef.current)
      ) {
        setActiveLocMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── District / commune options ────────────────────────────────
  // FIX: stagedProvince is now the label so compare directly to adm1_name
  const districtOptions = useMemo(() => {
    if (!stagedProvince) return [];
    return districtsData.features
      .filter((f) => f.properties.adm1_name === stagedProvince)
      .map((f) => f.properties.adm2_name ?? "")
      .filter(Boolean)
      .sort();
  }, [stagedProvince]);

  const communeOptions = useMemo(() => {
    if (!stagedDistrict) return [];
    return communesData.features
      .filter((f) => f.properties.adm2_name === stagedDistrict)
      .map((f) => f.properties.adm3_name ?? "")
      .filter(Boolean)
      .sort();
  }, [stagedDistrict]);

  // ── Apply — commit all staged to URL ─────────────────────────
  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (stagedCategoryIds.length > 0)
      params.set("cat", stagedCategoryIds.join(","));
    else params.delete("cat");

    // Convert adm1_name → backend value: use explicit overrides, fallback to space→underscore
    if (stagedProvince) {
      const backendValue =
        GEO_TO_BACKEND[stagedProvince] ?? stagedProvince.replace(/ /g, "_");
      params.set("province", backendValue);
    } else params.delete("province");

    if (stagedDistrict) params.set("district", stagedDistrict);
    else params.delete("district");

    if (stagedCommune) params.set("commune", stagedCommune);
    else params.delete("commune");

    if (stagedFrom) params.set("from", stagedFrom);
    else params.delete("from");

    if (stagedTo) params.set("to", stagedTo);
    else params.delete("to");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setOpenCategory(false);
    setActiveLocMenu(null);
    setPanelOpen(false); // close panel on mobile after apply
  };

  // ── Reset helpers ─────────────────────────────────────────────
  const removeCategory = (id: string) => {
    const next = stagedCategoryIds.filter((c) => c !== id);
    setStagedCategoryIds(next);
    pushToUrl({ cat: next.length > 0 ? next.join(",") : null });
  };

  const resetCategories = () => {
    setStagedCategoryIds([]);
    pushToUrl({ cat: null });
  };

  const resetLocation = () => {
    setStagedProvince(null);
    setStagedDistrict(null);
    setStagedCommune(null);
    pushToUrl({ province: null, district: null, commune: null });
  };

  const resetDateRange = () => {
    setStagedFrom(null);
    setStagedTo(null);
    pushToUrl({ from: null, to: null });
  };

  const toggleCategory = (id: string) => {
    setStagedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  // Active filter count for mobile badge
  const activeFilterCount =
    stagedCategoryIds.length +
    (stagedProvince ? 1 : 0) +
    (stagedFrom || stagedTo ? 1 : 0);

  return (
    // Mobile: shrink-0 so it doesn't grow; md+: full height flex column
    <div className="w-full shrink-0 md:h-full md:flex md:flex-col">
      {/* ── Mobile toggle button ── */}
      <button
        type="button"
        onClick={() => setPanelOpen((v) => !v)}
        className="md:hidden w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-(--secondary-color) pt-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4h18M7 8h10M11 12h2"
            />
          </svg>
          <span className="text-sm font-bold text-(--secondary-color)">
            Filters
          </span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-cyan-500 text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${panelOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* ── Panel body: always on md+, toggle on mobile ── */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out md:overflow-visible md:max-h-none md:opacity-100 md:flex-1 md:min-h-0 md:mt-0 ${panelOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="mt-4 md:mt-0 w-full bg-white rounded-xl border border-gray-100 p-4 sm:p-6 flex flex-col justify-between gap-6 shadow-sm h-fit md:h-full md:overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-5">
            {/* ── Search ── */}
            <div>
              <label className="block text-sm font-bold text-slate-800 tracking-wide mb-2 pl-1">
                Search Events
              </label>
              <div className="relative flex items-center border border-gray-200 rounded-lg h-10 bg-white transition-all hover:border-cyan-500 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100/50">
                <svg
                  className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search events..."
                  className="w-full h-full pl-9 pr-8 text-sm text-slate-600 bg-transparent outline-none font-inter"
                />
                {searchText && (
                  <button
                    onClick={() => setSearchText("")}
                    className="absolute right-3 text-slate-400 hover:text-slate-600"
                  >
                    <CloseCircle size={14} variant="Bold" />
                  </button>
                )}
              </div>
            </div>

            {/* ── Categories ── */}
            <div className="relative" ref={categoryDropdownRef}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-800 tracking-wide pl-1">
                  Categories
                </label>
                {stagedCategoryIds.length > 0 && (
                  <button
                    onClick={resetCategories}
                    className="text-xs text-cyan-500 font-semibold cursor-pointer hover:underline font-inter"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div
                onClick={() => setOpenCategory(!openCategory)}
                className={`flex items-center justify-between gap-2 px-3 border rounded-lg bg-white cursor-pointer transition-all h-10 ${openCategory ? "border-cyan-500 ring-2 ring-cyan-100/50" : "border-gray-200 hover:border-cyan-500"}`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden flex-1 min-w-0">
                  {stagedCategoryIds.length === 0 ? (
                    <span className="text-sm text-slate-400 font-inter truncate">
                      Select Categories
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 overflow-hidden flex-1 whitespace-nowrap">
                      {stagedCategoryIds.slice(0, 2).map((id) => {
                        const cat = categories.find((c) => c.id === id);
                        const config = cat
                          ? CATEGORY_CONFIG[cat.configKey]
                          : CATEGORY_CONFIG["Other"];
                        return (
                          <span
                            key={id}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold border shrink-0 font-inter"
                            style={{
                              background: config.bg,
                              borderColor: config.color,
                              color: config.color,
                            }}
                          >
                            {cat?.name ?? id}
                            <button
                              onClick={() => removeCategory(id)}
                              className="ml-0.5 hover:opacity-70"
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
                      {stagedCategoryIds.length > 2 && (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-lg bg-gray-100 text-slate-500 shrink-0 font-inter">
                          +{stagedCategoryIds.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <ArrowDown2
                  size={16}
                  className={`text-slate-400 transition-transform duration-200 shrink-0 ${openCategory ? "rotate-180 text-cyan-500" : ""}`}
                />
              </div>

              {openCategory && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-1.5 flex flex-col gap-0.5 overflow-y-auto h-60">
                  {categories.map((cat) => {
                    const config = CATEGORY_CONFIG[cat.configKey];
                    const IconComponent = config.icon;
                    const selected = stagedCategoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left w-full cursor-pointer font-inter ${selected ? "bg-cyan-50/60 text-cyan-500 font-semibold" : "hover:bg-gray-50 text-slate-500"}`}
                      >
                        <IconComponent
                          size={16}
                          color={selected ? "#06b6d4" : config.color}
                        />
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Location ── */}
            <div
              className="flex flex-col gap-3 relative"
              ref={locationDropdownRef}
            >
              <div className="flex items-center justify-between -mb-1">
                <label className="block text-sm font-bold text-slate-800 tracking-wide pl-1">
                  Location
                </label>
                {(stagedProvince || stagedDistrict || stagedCommune) && (
                  <button
                    onClick={resetLocation}
                    className="text-xs text-cyan-500 font-semibold cursor-pointer hover:underline font-inter"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Province */}
              <div className="relative">
                <div
                  onClick={() =>
                    setActiveLocMenu(
                      activeLocMenu === "province" ? null : "province",
                    )
                  }
                  className={`flex items-center justify-between gap-2 px-3 border rounded-lg bg-white h-10 cursor-pointer transition-all ${activeLocMenu === "province" ? "border-cyan-500 ring-2 ring-cyan-100/50" : "border-gray-200 hover:border-cyan-500"}`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Location size={16} color="#94a3b8" variant="Linear" />
                    <span
                      className={`text-sm truncate font-inter ${stagedProvince ? "text-slate-700 font-medium" : "text-slate-400"}`}
                    >
                      {stagedProvince ?? "Select Province..."}
                    </span>
                  </div>
                  <ArrowDown2
                    size={16}
                    className={`text-slate-400 transition-transform ${activeLocMenu === "province" ? "rotate-180" : ""}`}
                  />
                </div>
                {activeLocMenu === "province" && (
                  <div className="absolute top-11 left-0 right-0 max-h-60 overflow-y-auto border border-gray-200 bg-white rounded-xl z-50 shadow-xl p-1.5 flex flex-col gap-0.5">
                    {/* Display raw adm1_name from GeoJSON — no mapping needed */}
                    {GEO_PROVINCE_NAMES.map((name) => (
                      <div
                        key={name}
                        onClick={() => {
                          setStagedProvince(name);
                          setStagedDistrict(null);
                          setStagedCommune(null);
                          setActiveLocMenu(null);
                        }}
                        className="px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-gray-50 cursor-pointer font-inter"
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* District */}
              <div className="relative">
                <div
                  onClick={() =>
                    stagedProvince &&
                    setActiveLocMenu(
                      activeLocMenu === "district" ? null : "district",
                    )
                  }
                  className={`flex items-center justify-between gap-2 px-3 border rounded-lg h-10 text-sm ${!stagedProvince ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200" : activeLocMenu === "district" ? "border-cyan-500 ring-2 ring-cyan-100/50 bg-white cursor-pointer" : "border-gray-200 hover:border-cyan-500 bg-white cursor-pointer"}`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Location size={16} color="#94a3b8" variant="Linear" />
                    <span
                      className={`text-sm truncate font-inter ${stagedDistrict ? "text-slate-700 font-medium" : "text-slate-400"}`}
                    >
                      {stagedDistrict || "Select District..."}
                    </span>
                  </div>
                  <ArrowDown2
                    size={16}
                    className={`text-slate-400 transition-transform ${activeLocMenu === "district" ? "rotate-180" : ""}`}
                  />
                </div>
                {activeLocMenu === "district" && stagedProvince && (
                  <div className="absolute top-11 left-0 right-0 max-h-60 overflow-y-auto border border-gray-200 bg-white rounded-xl z-50 shadow-xl p-1.5 flex flex-col gap-0.5">
                    {districtOptions.map((d) => (
                      <div
                        key={d}
                        onClick={() => {
                          setStagedDistrict(d);
                          setStagedCommune(null);
                          setActiveLocMenu(null);
                        }}
                        className="px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-gray-50 cursor-pointer font-inter"
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Commune */}
              <div className="relative">
                <div
                  onClick={() =>
                    stagedDistrict &&
                    setActiveLocMenu(
                      activeLocMenu === "commune" ? null : "commune",
                    )
                  }
                  className={`flex items-center justify-between gap-2 px-3 border rounded-lg h-10 text-sm ${!stagedDistrict ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200" : activeLocMenu === "commune" ? "border-cyan-500 ring-2 ring-cyan-100/50 bg-white cursor-pointer" : "border-gray-200 hover:border-cyan-500 bg-white cursor-pointer"}`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Location size={16} color="#94a3b8" variant="Linear" />
                    <span
                      className={`text-sm truncate font-inter ${stagedCommune ? "text-slate-700 font-medium" : "text-slate-400"}`}
                    >
                      {stagedCommune || "Select Commune..."}
                    </span>
                  </div>
                  <ArrowDown2
                    size={16}
                    className={`text-slate-400 transition-transform ${activeLocMenu === "commune" ? "rotate-180" : ""}`}
                  />
                </div>
                {activeLocMenu === "commune" && stagedDistrict && (
                  <div className="absolute top-11 left-0 right-0 max-h-50 overflow-y-auto border border-gray-200 bg-white rounded-xl z-50 shadow-xl p-1.5 flex flex-col gap-0.5">
                    {communeOptions.map((c) => (
                      <div
                        key={c}
                        onClick={() => {
                          setStagedCommune(c);
                          setActiveLocMenu(null);
                        }}
                        className="px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-gray-50 cursor-pointer font-inter"
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Date Range ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-800 tracking-wide pl-1">
                  Date Range
                </label>
                {(stagedFrom || stagedTo) && (
                  <button
                    onClick={resetDateRange}
                    className="text-xs text-cyan-500 font-semibold cursor-pointer hover:underline font-inter"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="relative w-full flex items-center gap-2 px-3 border border-gray-200 rounded-lg h-10 bg-white hover:border-cyan-500 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100/50 transition-all">
                  <Calendar
                    size={16}
                    color="#94a3b8"
                    variant="Linear"
                    className="shrink-0 pointer-events-none z-10"
                  />
                  <input
                    type="date"
                    value={stagedFrom ?? ""}
                    max={stagedTo ?? undefined}
                    onChange={(e) => setStagedFrom(e.target.value || null)}
                    className="flex-1 min-w-0 text-sm text-slate-600 bg-transparent focus:outline-none font-inter cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0"
                  />
                </div>
                <div className="relative w-full flex items-center gap-2 px-3 border border-gray-200 rounded-lg h-10 bg-white hover:border-cyan-500 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100/50 transition-all">
                  <Calendar
                    size={16}
                    color="#94a3b8"
                    variant="Linear"
                    className="shrink-0 pointer-events-none z-10"
                  />
                  <input
                    type="date"
                    value={stagedTo ?? ""}
                    min={stagedFrom ?? undefined}
                    onChange={(e) => setStagedTo(e.target.value || null)}
                    className="flex-1 min-w-0 text-sm text-slate-600 bg-transparent focus:outline-none font-inter cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex flex-col gap-2.5 mt-2">
            <button
              onClick={handleApply}
              className="w-full h-11 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-poppins"
            >
              Apply Filters
            </button>
            <Link
              href={isOrgMode ? "/organizer/events/create" : "/events/create"}
              className="w-full h-11 border border-gray-200 text-slate-700 font-bold text-xs rounded-lg transition-all hover:bg-gray-50 flex items-center justify-center cursor-pointer uppercase tracking-wider font-poppins"
            >
              Create Event
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
