import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_HEIGHTS = [280, 340, 220, 420, 260, 310, 240, 380, 290, 330, 250, 400, 270, 360, 230];

export function GallerySkeleton() {
    const columnCount = 3;
    const columns = Array.from({ length: columnCount }, (_, col) =>
        SKELETON_HEIGHTS.filter((_, i) => i % columnCount === col)
    );

    return (
        <div className="w-full mt-4">
            <div className="flex gap-4">
                {columns.map((col, colIdx) => (
                    <div key={colIdx} className="flex-1 min-w-0">
                        {col.map((height, i) => (
                            <Skeleton
                                key={i}
                                className="relative rounded-[20px] overflow-hidden mb-4 border border-slate-100 card-shadow"
                                style={{ height }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
