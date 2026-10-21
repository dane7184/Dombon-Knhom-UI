import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function EventCardSkeleton() {
    return (
        <div className="w-full bg-white rounded-[12px] overflow-hidden shadow-sm flex flex-col border border-gray-50/50">
            <div className="relative w-full aspect-16/10 sm:aspect-video shrink-0">
                <Skeleton className="absolute inset-0 rounded-none" />
                <Skeleton className="absolute top-3 left-3 h-7 w-28 rounded-full bg-gray-300/70" />
                <Skeleton className="absolute top-3 right-3 h-7 w-14 rounded-full bg-gray-300/70" />
                <Skeleton className="absolute bottom-3 left-4 h-5 w-2/3 rounded bg-gray-300/70" />
            </div>

            <div className="px-4 py-3 flex-1 flex flex-col justify-between gap-2.5">
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-3.5 w-32" />
                        </div>
                        <Skeleton className="h-6 w-6 rounded-full" />
                    </div>

                    <Skeleton className="h-5 w-24 rounded-full" />

                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3.5 w-3/4" />
                    </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 shrink-0">
                    <div className="flex gap-4">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                    <Skeleton className="h-3.5 w-20" />
                </div>
            </div>
        </div>
    );
}

export default function Loading() {
    return (
        <div className="pt-24 md:pt-28 px-4 pb-4 flex flex-col md:flex-row h-auto md:h-screen w-full md:overflow-hidden bg-background gap-6">
            <div className="w-full md:w-[20%] shrink-0">
                <div className="w-full h-fit md:h-full bg-white rounded-xl border border-gray-100 p-4 sm:p-6 flex flex-col gap-5 shadow-sm">
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-24" />
                        <div className="flex flex-col 2xl:flex-row gap-2">
                            <Skeleton className="h-10 w-full rounded-md" />
                            <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2.5 mt-2">
                        <Skeleton className="h-11 w-full rounded-md" />
                        <Skeleton className="h-11 w-full rounded-md" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col flex-1 overflow-hidden gap-4">
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 bg-gray-200 rounded-lg p-1.5">
                        <Skeleton className="h-9 w-24 rounded-md" />
                        <Skeleton className="h-9 w-24 rounded-md" />
                    </div>
                    <div className="flex items-center gap-1 bg-gray-200 rounded-lg p-1.5">
                        <Skeleton className="h-9 w-20 rounded-md" />
                        <Skeleton className="h-9 w-20 rounded-md" />
                        <Skeleton className="h-9 w-20 rounded-md" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full overflow-y-auto">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <EventCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
