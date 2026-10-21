"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AppContentType } from "@/types/common.type";

interface FilterSavedProps {
    onChange?: (type: AppContentType) => void;
}

export default function FilterSaved({ onChange }: FilterSavedProps) {
    const searchParams = useSearchParams();
    const active = (searchParams.get('content') as AppContentType) ?? 'Event';  // ← read from URL

    const getTabClass = (tab: AppContentType) =>
        `${active === tab ? "bg-white text-(--secondary-color) shadow" : "text-white hover:bg-white/10"}
        flex-1 sm:flex-none sm:px-6 py-2 flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-all cursor-pointer`;

    return (
        <div className="flex items-center gap-1 bg-(--main-color) rounded-lg w-full sm:w-auto p-1.5">
            <button
                type="button"
                onClick={() => onChange?.("Event")}
                className={getTabClass("Event")}
            >
                Event
            </button>
            <button
                type="button"
                onClick={() => onChange?.("Activity")}
                className={getTabClass("Activity")}
            >
                Activity
            </button>
        </div>
    );
}