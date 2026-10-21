"use client";

import { GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import { Feature, FeatureCollection, Geometry } from "geojson";

import communesJson from "@/data/map/khm_admin3.json";
import { CommuneCollection, CommuneFeature } from "@/types/map.type";
import { baseStyle, selectedStyle } from "@/lib/Maputils";

const data = communesJson as CommuneCollection;

interface CommuneLayerProps {
  district: string;
  selected: string | null;
  onSelect: (name: string, geometry: Geometry) => void;
}

export default function CommuneLayer({
  district,
  selected,
  onSelect,
}: CommuneLayerProps) {
  const map = useMap();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  // 1. Gather all communes in the active district
  const districtFeatures = data.features.filter(
    (f) => f.properties.adm2_name === district,
  );

  // 2. Isolate ONLY the single selected commune feature
  const selectedFeature = districtFeatures.find(
    (f) => f.properties.adm3_name === selected,
  );

  return (
    <>
      {/* BACKGROUND SHEET: Renders all communes with standard styles */}
      <GeoJSON
        key={`communes-base-${district}`}
        data={
          {
            type: "FeatureCollection",
            features: districtFeatures,
          } as FeatureCollection
        }
        style={() => baseStyle}
        onEachFeature={(
          feature: Feature<Geometry, CommuneFeature["properties"]>,
          layer,
        ) => {
          layer.bindTooltip(feature.properties.adm3_name);
          layer.on("click", () => {
            map.fitBounds(
              (layer as L.Polygon).getBounds(),
              isMobile
                ? { paddingTopLeft: [25, 75], paddingBottomRight: [25, 250] }
                : { padding: [120, 120] },
            );
            onSelect(feature.properties.adm3_name, feature.geometry);
          });
        }}
      />

      {/* FOREGROUND HIGHLIGHT: Renders purely on top of the background layout sheets */}
      {selectedFeature && (
        <GeoJSON
          key={`commune-highlight-${district}-${selected}`}
          data={selectedFeature as any}
          style={() => ({
            ...selectedStyle,
            weight: 3, // Crisp, slightly heavier thickness
            fillOpacity: 0.15, // Light overlay background tint
          })}
          onEachFeature={(feature, layer) => {
            // Keep tooltips working flawlessly when hovering directly over the active border
            layer.bindTooltip((feature.properties as any).adm3_name);
          }}
        />
      )}
    </>
  );
}
