"use client";

import { LocateFixed, Plus, Minus } from "lucide-react";
import Link from "next/link";
import L from "leaflet";
import { useAuth } from "@/hooks/useAuth";

interface MapControlsProps {
  map: L.Map | null;
  onLocate: (coords: [number, number]) => void;
}

export default function MapControls({ map, onLocate }: MapControlsProps) {
  const { isOrgMode } = useAuth();

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      onLocate([pos.coords.latitude, pos.coords.longitude]);
    });
  };

  return (
    // Mobile: w-8 h-8 buttons to match ViewTabBar/DateTabBar height (h-8 = 32px + p-1.5 wrapper)
    // lg+: original w-12 h-12, bottom-8
    <div className="absolute right-4 bottom-86 lg:right-4 lg:bottom-8 z-1000 flex flex-col items-center gap-2 lg:gap-3">
      <button
        onClick={handleLocate}
        className="w-11 h-11 lg:w-12 lg:h-12 bg-(--secondary-color) rounded-lg lg:rounded-xl shadow-lg flex items-center justify-center cursor-pointer"
        title="Zoom to my location"
      >
        <LocateFixed size={18} className="lg:hidden" color="#FFFFFF" />
        <LocateFixed size={24} className="hidden lg:block" color="#FFFFFF" />
      </button>

      <div className="flex flex-col rounded-lg lg:rounded-xl overflow-hidden shadow-lg bg-(--secondary-color)">
        <button
          onClick={() => map?.zoomIn()}
          className="w-11 h-11 lg:w-12 lg:h-12 flex items-center justify-center text-white font-light border-b border-white/20 cursor-pointer"
        >
          <Plus size={18} className="lg:hidden" color="white" />
          <Plus size={24} className="hidden lg:block" color="white" />
        </button>
        <button
          onClick={() => map?.zoomOut()}
          className="w-11 h-11 lg:w-12 lg:h-12 flex items-center justify-center text-white font-light cursor-pointer"
        >
          <Minus size={18} className="lg:hidden" color="white" />
          <Minus size={24} className="hidden lg:block" color="white" />
        </button>
      </div>

      <Link
        href={isOrgMode ? "/organizer/events/create" : "/events/create"}
        className="w-11 h-11 lg:w-12 lg:h-12 bg-(--main-color) rounded-lg lg:rounded-xl shadow-xl flex items-center justify-center cursor-pointer"
        title="Create event"
      >
        <Plus size={18} className="lg:hidden" color="white" />
        <Plus size={24} className="hidden lg:block" color="white" />
      </Link>
    </div>
  );
}
