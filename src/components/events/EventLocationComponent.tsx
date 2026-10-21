// src/components/events/EventLocationComponent.tsx
"use client";

import React, { useState } from "react";
import "@/app/globals.css";
import { TrendUp, Gps } from "iconsax-react";
import L from "leaflet";
import dynamic from "next/dynamic";
import { EventDetail, MapEvent } from "@/types/event.type";

const EventLeafletMap = dynamic(() => import("./EventLeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-sm text-slate-400">
      Loading Map View...
    </div>
  ),
});

interface EventLocationComponentProps {
  event: EventDetail;
}

export const EventLocationComponent = ({
  event,
}: EventLocationComponentProps) => {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const position: [number, number] = [
    event.location.lat || 11.5564,
    event.location.lng || 104.9282,
  ];

  // Build a minimal MapEvent from EventDetail for the map pin
  const mapEvent: MapEvent = {
    id: event.id,
    title: event.title,
    description: event.description,
    category: event.category,
    imageUrl: event.imageUrl,
    lat: event.location.lat,
    lng: event.location.lng,
    price: event.price,
    isFree: event.isFree,
    rating: event.ratingSummary?.average ?? 0,
    isLiked: event.isLiked,
    isSaved: event.isSaved,
    isJoined: event.isJoined,
    startDate: event.startDate,
    endDate: event.endDate,
    location: {
      province: event.location.province ?? "",
      district: event.location.district ?? "",
      commune: event.location.commune ?? "",
      specificAddr: event.location.specificAddr ?? "",
    },
  };

  const handleRecenterMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapInstance) {
      mapInstance.flyTo(position, 16, { duration: 1.2 });
    }
  };

  const handleGetDirections = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const url =
          `https://www.google.com/maps/dir/?api=1` +
          `&origin=${pos.coords.latitude},${pos.coords.longitude}` +
          `&destination=${position[0]},${position[1]}` +
          `&travelmode=driving`;
        window.open(url, "_blank");
      },
      () => {
        const url =
          `https://www.google.com/maps/dir/?api=1` +
          `&destination=${position[0]},${position[1]}` +
          `&travelmode=driving`;
        window.open(url, "_blank");
      },
    );
  };

  return (
    <div className="w-full p-5 bg-(--background-white) rounded-[15px] box-shadow flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-(--secondary-color)">
        Location
      </h3>

      <div className="w-full h-62 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative z-0">
        <button
          onClick={handleRecenterMap}
          title="Recenter Map"
          className="absolute bottom-4 right-4 z-400 bg-white p-2.5 rounded-xl shadow-md border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-slate-700 cursor-pointer flex items-center justify-center"
        >
          <Gps size={20} className="text-(--main-color)" />
        </button>

        <EventLeafletMap
          position={position}
          event={mapEvent}
          setMapInstance={setMapInstance}
        />
      </div>

      <div className="flex flex-col gap-0.5">
        <h3 className="text-lg font-semibold text-slate-800">
          {[
            event.location.province ?? "",
            event.location.district ?? "",
            event.location.commune ?? "",
          ]
            .filter(Boolean)
            .join(", ") || "Unknown Location"}
        </h3>
        <p className="text-sm font-medium text-slate-500 leading-relaxed">
          {event.location.specificAddr ?? ""}
        </p>
      </div>

      <div>
        <button
          onClick={handleGetDirections}
          className="btn-main w-full flex items-center justify-center cursor-pointer py-3 rounded-xl font-semibold gap-2 transition-transform active:scale-98"
        >
          <TrendUp size={20} color="#FFFFFF" />
          <span>Get Directions</span>
        </button>
      </div>
    </div>
  );
};
