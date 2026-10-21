"use client";

import { GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import { Feature, Geometry } from "geojson";

import provincesJson from "@/data/map/khm_admin1.json";
import {
  ProvinceCollection,
  ProvinceFeature,
  OnSelectWithGeometry,
} from "@/types/map.type";
import { baseStyle } from "@/lib/Maputils";

const data = provincesJson as ProvinceCollection;

interface ProvinceLayerProps {
  onSelect: OnSelectWithGeometry;
}

export default function ProvinceLayer({ onSelect }: ProvinceLayerProps) {
  const map = useMap();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  return (
    <GeoJSON
      key="provinces"
      data={data}
      style={() => baseStyle}
      onEachFeature={(
        feature: Feature<Geometry, ProvinceFeature["properties"]>,
        layer,
      ) => {
        layer.bindTooltip(feature.properties.adm1_name);
        layer.on("click", () => {
          map.fitBounds(
            (layer as L.Polygon).getBounds(),
            isMobile
              ? { paddingTopLeft: [25, 90], paddingBottomRight: [25, 250] }
              : { padding: [20, 20] },
          );
          onSelect(feature.properties.adm1_name, feature.geometry);
        });
      }}
    />
  );
}
