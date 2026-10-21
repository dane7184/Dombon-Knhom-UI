"use client";

import { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { Geometry } from "geojson";
import "leaflet/dist/leaflet.css";

import districtsJson from "@/data/map/khm_admin2.json";
import provincesJson from "@/data/map/khm_admin1.json";
import {
  DistrictCollection,
  MapSelection,
  ProvinceCollection,
} from "@/types/map.type";
import { filterByPolygon } from "@/services/event.service";
import { useMapFilter } from "@/hooks/useMapFilter";

import ProvinceLayer from "./ProvinceLayer";
import DistrictLayer from "./DistrictLayer";
import CommuneLayer from "./CommuneLayer";
import MapBreadcrumb from "./MapBreadcrumb";
import EventPin from "./EventPin";
import MapControls from "./MapControls";
import FilterBar from "./FilterBar";
import { MapEvent } from "@/types/event.type";
import { useDebounce } from "@/hooks/useDebounce";

const provincesData = provincesJson as ProvinceCollection;
const districtsData = districtsJson as DistrictCollection;

const INITIAL_SELECTION: MapSelection = {
  province: null,
  district: null,
  commune: null,
};

interface MapClientProps {
  events: MapEvent[];
}

// Detect mobile once on the client — Leaflet only runs in the browser
const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

export default function MapClient({ events: allEvents }: MapClientProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [sel, setSel] = useState<MapSelection>(INITIAL_SELECTION);
  const [activePolygon, setActivePolygon] = useState<Geometry | null>(null);
  const [filter, setFilter] = useMapFilter();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );

  const debouncedProvince = useDebounce(sel.province, 400);
  const debouncedDistrict = useDebounce(sel.district, 400);
  const debouncedCommune = useDebounce(sel.commune, 400);

  useEffect(() => {
    setFilter({
      province: debouncedProvince,
      district: debouncedDistrict,
      commune: debouncedCommune,
    });
  }, [debouncedProvince, debouncedDistrict, debouncedCommune]);

  const events = useMemo(
    () => filterByPolygon(allEvents ?? [], activePolygon),
    [allEvents, activePolygon],
  );

  const handleBack = () => {
    map?.closePopup();

    // Same top-anchored framing as drill-in on mobile.
    const backFit = isMobile
      ? {
          paddingTopLeft: [25, 90] as [number, number],
          paddingBottomRight: [25, 250] as [number, number],
        }
      : { padding: [20, 20] as [number, number] };

    if (sel.commune) {
      setSel((s) => ({ ...s, commune: null }));
      const feature = districtsData.features.find(
        (f) =>
          f.properties.adm2_name === sel.district &&
          f.properties.adm1_name === sel.province,
      );
      if (feature) {
        map?.fitBounds(L.geoJSON(feature).getBounds(), backFit);
        setActivePolygon(feature.geometry);
      }
      return;
    }

    if (sel.district) {
      setSel((s) => ({ ...s, district: null, commune: null }));
      const feature = provincesData.features.find(
        (f) => f.properties.adm1_name === sel.province,
      );
      if (feature) {
        map?.fitBounds(L.geoJSON(feature).getBounds(), backFit);
        setActivePolygon(feature.geometry);
      }
      return;
    }

    if (sel.province) {
      setSel(INITIAL_SELECTION);
      setActivePolygon(null);
      // Reset to the same framing the map initialized with, per view
      map?.setView(isMobile ? [10.5, 105] : [12.5, 105], isMobile ? 6 : 7, {
        animate: true,
        duration: 1.2,
      });
    }
  };

  const handleLocate = (coords: [number, number]) => {
    setUserLocation(coords);
    setSel(INITIAL_SELECTION);
    setActivePolygon(null);
    map?.closePopup();
    map?.flyTo(coords, 17, { duration: 1.5 });
  };

  const userLocationIcon = L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:20px;height:20px;">
        <div style="position:absolute;top:50%;left:50%;width:36px;height:36px;background:rgba(59,130,246,0.3);border-radius:9999px;transform:translate(-50%,-50%);animation:pulse 1.5s infinite;"></div>
        <div style="position:absolute;top:50%;left:50%;width:14px;height:14px;background:#2563eb;border:3px solid white;border-radius:9999px;transform:translate(-50%,-50%);"></div>
      </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={isMobile ? [10.5, 105] : [12.5, 105]}
        // Mobile: zoom 6 fits Cambodia more tightly; desktop: original 7
        zoom={isMobile ? 6 : 7}
        minZoom={isMobile ? 6 : 6}
        maxBoundsViscosity={1.0}
        className="h-full w-full"
        zoomControl={false}
        ref={setMap}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon} />
        )}

        {!sel.province && (
          <ProvinceLayer
            onSelect={(name, geometry) => {
              setSel({ province: name, district: null, commune: null });
              setActivePolygon(geometry);
              map?.closePopup();
            }}
          />
        )}

        {sel.province && !sel.district && (
          <DistrictLayer
            province={sel.province}
            onSelect={(name, geometry) => {
              setSel((s) => ({ ...s, district: name, commune: null }));
              setActivePolygon(geometry);
              map?.closePopup();
            }}
          />
        )}

        {sel.province && sel.district && (
          <CommuneLayer
            district={sel.district}
            selected={sel.commune}
            onSelect={(name, geometry) => {
              setSel((s) => ({ ...s, commune: name }));
              setActivePolygon(geometry);
              map?.closePopup();
            }}
          />
        )}

        {events.map((event) => (
          <EventPin key={event.id} event={event} />
        ))}
      </MapContainer>

      <MapBreadcrumb selection={sel} onBack={handleBack} />
      <MapControls map={map} onLocate={handleLocate} />
      <FilterBar filter={filter} onChange={setFilter} />
    </div>
  );
}
