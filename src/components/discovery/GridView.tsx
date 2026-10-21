"use client";

import {memo, startTransition, useEffect, useMemo, useRef, useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {GalleryResponse} from "@/types/activity.type";
import {resolveMediaUrl} from "@/lib/media";
const loadedIds = new Set<string | number>();

const GalleryMediaItem = memo(({ data: item }: { data: GalleryResponse }) => {
    const alreadyLoaded = loadedIds.has(item.id);
    const [isLoading, setIsLoading] = useState(!alreadyLoaded);
    const [hasError, setHasError] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => startTransition(() => setVisible(true)));
        return () => cancelAnimationFrame(id);
    }, []);

    return (
        <Link
            href={`/posts/${item.id}`}
            id={`gallery-item-${item.id}`}
            onClick={() => {
                const container = document.getElementById("gallery-scroll-container");
                const el = document.getElementById(`gallery-item-${item.id}`);
                const offset = container && el
                    ? Math.round(el.getBoundingClientRect().top - container.getBoundingClientRect().top)
                    : 0;
                sessionStorage.setItem("gallery-last-item", JSON.stringify({ id: String(item.id), offset }));
            }}
            className={`relative block rounded-lg md:rounded-[20px] overflow-hidden bg-[var(--background-white)] group cursor-pointer card-shadow border border-[var(--input-border)] transition-all duration-300 hover:scale-[1.015] mb-4 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}${isLoading || hasError ? " min-h-[200px]" : ""}`}
        >
            {(isLoading || hasError) && (
                <div className={`absolute inset-0 z-10 bg-gradient-to-br from-slate-100/80 to-slate-50 flex items-center justify-center ${hasError ? "" : "animate-pulse"}`}>
                    <svg
                        className={`w-10 h-10 ${hasError ? "text-slate-300" : "text-slate-200"}`}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round"
                    >
                        {item.type === "VIDEO" ? (
                            <>
                                <path d="M23 7l-7 5 7 5V7z" />
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </>
                        ) : (
                            <>
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </>
                        )}
                    </svg>
                </div>
            )}

            {!hasError && item.type === "VIDEO" && (
                <video
                    src={resolveMediaUrl(item.src)}
                    className={`w-full h-auto block rounded-lg md:rounded-[20px] transition-opacity duration-500 ${isLoading ? "opacity-0" : "opacity-100"}`}
                    playsInline preload="metadata"
                    onLoadedData={() => { loadedIds.add(item.id); setIsLoading(false); }}
                    onError={() => { setIsLoading(false); setHasError(true); }}
                />
            )}

            {!hasError && item.type === "IMAGE" && (
                <Image
                    src={resolveMediaUrl(item.src)}
                    alt={item.alt || "Gallery Item"}
                    width={0} height={0}
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    className={`w-full h-auto block rounded-lg md:rounded-[20px] transition-opacity duration-500 ${isLoading ? "opacity-0" : "opacity-100"}`}
                    style={{ width: "100%", height: "auto", display: "block" }}
                    onLoad={() => { loadedIds.add(item.id); setIsLoading(false); }}
                    onError={() => { setIsLoading(false); setHasError(true); }}
                />
            )}

            {item.type === "VIDEO" && (
                <div
                    className="absolute top-3 left-3 bg-white/25 backdrop-blur-xl text-white text-[12px] font-semibold font-inter px-3 py-1 rounded-[20px] flex items-center justify-center gap-1.5 tracking-wide border border-white/30 z-20"
                    style={{ boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5), 0 4px 12px rgba(0,0,0,0.08)" }}
                >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5.14v13.72a1 1 0 001.5.86l11.04-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z" />
                    </svg>
                    {item.duration || "0:00"}
                </div>
            )}

            {item.type === "IMAGE" && item.hasMore && (
                <div
                    className="absolute top-3 right-3 bg-white/25 backdrop-blur-xl text-white p-2 rounded-[10px] flex items-center justify-center border border-white/30 z-20"
                    style={{ boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5), 0 4px 12px rgba(0,0,0,0.08)" }}
                >
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                        <path d="M16 12.9V17.1C16 20.1 14.1 22 11.1 22H6.9C3.9 22 2 20.1 2 17.1V12.9C2 9.9 3.9 8 6.9 8H11.1C14.1 8 16 9.9 16 12.9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 6.9V11.1C22 14.1 20.1 16 17.1 16H16V12.9C16 9.9 14.1 8 11.1 8H8V6.9C8 3.9 9.9 2 12.9 2H17.1C20.1 2 22 3.9 22 6.9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            )}

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 z-20 pointer-events-none" />
        </Link>
    );
}, (prev, next) => prev.data.id === next.data.id);

GalleryMediaItem.displayName = "GalleryMediaItem";

export default function GridView({ galleryData }: { galleryData: GalleryResponse[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            startTransition(() => setWidth(entry.contentRect.width));
        });
        ro.observe(el);
        startTransition(() => setWidth(el.clientWidth));
        return () => ro.disconnect();
    }, []);

    const columnCount = width < 640 ? 3 : width < 1024 ? 4 : 5;
    const columns = useMemo(
        () => Array.from({ length: columnCount }, (_, col) =>
            galleryData.filter((_, i) => i % columnCount === col)
        ),
        [columnCount, galleryData]
    );

    return (
        <div ref={containerRef} className="flex gap-4">
            {columns.map((col, colIdx) => (
                <div key={colIdx} className="flex-1 min-w-0">
                    {col.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                contentVisibility: "auto",
                                containIntrinsicSize: "auto 300px",
                            }}
                        >
                            <GalleryMediaItem data={item} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
