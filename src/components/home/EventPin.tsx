"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CATEGORY_CONFIG,
  resolveCategoryKey,
} from "@/constant/category.config";
import EventCard from "./EventCard";
import { MapEvent } from "@/types/event.type";

// isMobile check runs once at module level (client-only, SSR-safe via the "use client" directive)
const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

function buildIcon(event: MapEvent): L.DivIcon {
  const configKey = resolveCategoryKey(event.category);
  const config = CATEGORY_CONFIG[configKey];
  const CategoryIcon = config.icon;

  // Mobile: 12px icon / 24px inner circle / 30px outer circle / 5px tail
  // Desktop: original 16px icon / 32px inner / 40px outer / 7px tail
  const iconSize = isMobile ? 12 : 16;
  const innerSize = isMobile ? 24 : 32;
  const outerSize = isMobile ? 30 : 40;
  const tailW = isMobile ? 5 : 7;
  const tailH = isMobile ? 7 : 10;
  const wrapW = isMobile ? 32 : 42;
  const wrapH = isMobile ? 40 : 52;
  const anchorX = isMobile ? 16 : 21;
  const anchorY = isMobile ? 38 : 50;

  const svg = renderToStaticMarkup(
    <CategoryIcon size={iconSize} color="#ffffff" />,
  );

  const html = `
    <div style="position: relative; width: ${wrapW}px; height: ${wrapH}px; display: flex; justify-content: center; align-items: flex-start;">
      <div style="
        filter: drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.25));
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
      ">
        <div style="
          width: ${outerSize}px;
          height: ${outerSize}px;
          background: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
        ">
          <div style="
            width: ${innerSize}px;
            height: ${innerSize}px;
            background: ${config.color};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ${svg}
          </div>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: ${tailW}px solid transparent;
          border-right: ${tailW}px solid transparent;
          border-top: ${tailH}px solid #ffffff;
          margin-top: -4px;
          position: relative;
          z-index: 1;
        "></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconAnchor: [anchorX, anchorY],
  });
}

interface EventPinProps {
  event: MapEvent;
}

export default function EventPin({ event }: EventPinProps) {
  return (
    <Marker position={[event.lat, event.lng]} icon={buildIcon(event)}>
      <Popup
        closeButton={false}
        className="event-popup"
        // Mobile: narrower popup; desktop: original sizing
        maxWidth={isMobile ? 280 : 420}
        minWidth={isMobile ? 220 : 320}
      >
        <EventCard event={event} />
      </Popup>
    </Marker>
  );
}
