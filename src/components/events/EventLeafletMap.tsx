// src/components/events/EventLeafletMap.tsx
"use client";

import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import EventPin from "@/components/home/EventPin";
import L from "leaflet";
import { MapEvent } from "@/types/event.type";

interface EventLeafletMapProps {
  position: [number, number];
  event: MapEvent;
  setMapInstance: (map: L.Map | null) => void;
}

export default function EventLeafletMap({
  position,
  event,
  setMapInstance,
}: EventLeafletMapProps) {
  return (
    <MapContainer
      center={position}
      zoom={15}
      className="h-full w-full"
      ref={setMapInstance}
      zoomControl={true}
      dragging={true}
      scrollWheelZoom={true}
      doubleClickZoom={true}
      touchZoom={true}
      keyboard={true}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <EventPin event={event} />
    </MapContainer>
  );
}
