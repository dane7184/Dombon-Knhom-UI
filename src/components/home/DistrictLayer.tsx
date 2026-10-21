"use client";

import { GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import { Feature, FeatureCollection, Geometry } from "geojson";

import districtsJson from "@/data/map/khm_admin2.json";
import {
  DistrictCollection,
  DistrictFeature,
  OnSelectWithGeometry,
} from "@/types/map.type";
import { baseStyle } from "@/lib/Maputils";

const data = districtsJson as DistrictCollection;

interface DistrictLayerProps {
  province: string;
  onSelect: OnSelectWithGeometry;
}

export default function DistrictLayer({
  province,
  onSelect,
}: DistrictLayerProps) {
  const map = useMap();
  // Mobile screens are too narrow for the large desktop fitBounds padding.
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  const features = data.features.filter(
    (f) => f.properties.adm1_name === province,
  );

  return (
    <GeoJSON
      key={`districts-${province}`}
      data={{ type: "FeatureCollection", features } as FeatureCollection}
      style={() => baseStyle}
      onEachFeature={(
        feature: Feature<Geometry, DistrictFeature["properties"]>,
        layer,
      ) => {
        layer.bindTooltip(feature.properties.adm2_name);
        layer.on("click", () => {
          map.fitBounds(
            (layer as L.Polygon).getBounds(),
            isMobile
              ? { paddingTopLeft: [25, 90], paddingBottomRight: [25, 250] }
              : { padding: [80, 80] },
          );
          onSelect(feature.properties.adm2_name, feature.geometry);
        });
      }}
    />
  );
}
