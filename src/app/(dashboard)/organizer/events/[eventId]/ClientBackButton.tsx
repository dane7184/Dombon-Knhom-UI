"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "iconsax-react";

export default function ClientBackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#18abc6] cursor-pointer bg-transparent border-none p-0"
        >
            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                <ArrowLeft size={16} color="currentColor" />
            </span>
            <span className="text-sm font-medium">Back</span>
        </button>
    );
}