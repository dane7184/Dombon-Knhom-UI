"use client";

import {useRouter} from "next/navigation";
import {ArrowLeft} from "lucide-react";

export default function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="z-10 inline-flex items-center gap-1 font-medium hover:opacity-80 cursor-pointer main-color w-fit whitespace-nowrap"
        >
            <div className="bg-white p-2 rounded-full mr-2 shadow-sm">
                <ArrowLeft size={18} color="currentColor" className="shrink-0"/>
            </div>
            <span>Back</span>
        </button>
    );
}
