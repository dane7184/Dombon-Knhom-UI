import {Skeleton} from "@/components/ui/skeleton";
import React from "react";

export function FeedSkeleton() {
    return (
        <div className="flex flex-col gap-5 w-full">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="w-full rounded-xl p-4 bg-[var(--background-white)] card-shadow border border-[var(--input-border)] flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-2.5 w-20" />
                        </div>
                    </div>
                    <Skeleton className="h-[400px] w-full rounded-lg" />
                    <Skeleton className="h-3 w-3/4" />
                </div>
            ))}
        </div>
    );
}
