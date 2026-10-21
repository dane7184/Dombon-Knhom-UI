"use client";

import { Suspense } from "react";
import { MapEvent } from "@/types/event.type";
import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("@/components/home/MapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-50">
      <p className="text-slate-400 font-medium animate-pulse">Loading map…</p>
    </div>
  ),
});

interface Props {
  events: MapEvent[];
}

// Suspense wraps MapClient because it uses useSearchParams via useMapFilter
export default function MapClientLoader({ events }: Props) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-slate-50">
          <p className="text-slate-400 font-medium animate-pulse">
            Loading map…
          </p>
        </div>
      }
    >
      <MapClient events={events ?? []} />
    </Suspense>
  );
}
