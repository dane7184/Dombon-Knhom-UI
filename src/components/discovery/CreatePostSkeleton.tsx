import {Skeleton} from "@/components/ui/skeleton";
import React from "react";

export function CreatePostSkeleton() {
    return (
        <div className="w-full rounded-xl p-3 bg-[var(--background-white)] border border-[var(--input-border)] flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <Skeleton className="h-9 flex-1 rounded-full" />
        </div>
    );
}
