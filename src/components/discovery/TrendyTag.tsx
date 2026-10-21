'use client'
import {useTrendingTags} from "@/hooks/useTrendingTags";

export default function TrendyTag() {
    const {data: tags = [], isLoading, error} = useTrendingTags(10);

    if (isLoading) return <div className="p-5 text-xs text-gray-500">Loading trends...</div>;
    if (error) return <div className="p-5 text-xs text-red-500">Error: {error.message}</div>;
    return (
        <div className="bg-[var(--background-white)] w-full p-5 rounded-xl card-shadow border border-[var(--input-border)] flex flex-col gap-3">
            <div className="flex justify-between">
                <h3 className="text-sm font-bold text-[var(--text-main)] tracking-tight">Trendy Tag</h3>
            </div>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                 <span key={tag.tagId} className="text-xs font-medium text-[var(--main-color)] bg-[var(--background-color)] px-3 py-1.5 rounded-full transition-all">
                #{tag.name}
                </span>
                ))}
            </div>
        </div>
    )
}
