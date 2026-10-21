import {Skeleton} from "@/components/ui/skeleton";

export function EventsSkeleton() {
    return (
        <div className="flex flex-col gap-3 w-full rounded-xl p-4 bg-[var(--background-white)] border border-[var(--input-border)]">
            <Skeleton className="h-4 w-32" />
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                    <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
                    <div className="flex flex-col gap-1.5 flex-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-2.5 w-2/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}
