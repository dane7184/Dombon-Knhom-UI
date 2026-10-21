import L, { LatLngBoundsExpression } from "leaflet";
import { Feature, Geometry } from "geojson";

// ─── customize here ───────────────────────────────────────────────────────────

export const baseStyle: L.PathOptions = {
  color: "#1c274c80",
  weight: 1.5,
  fillOpacity: 0,
  fillColor: "transparent",
};

export const selectedStyle: L.PathOptions = {
  color: "#18abc6",
  weight: 2,
  fillColor: "#18abc6",
  fillOpacity: 0.15,
};

// ─────────────────────────────────────────────────────────────────────────────

export function getBounds(
  features: Feature<Geometry>[],
): LatLngBoundsExpression {
  const coords = features.flatMap((f) => {
    if (f.geometry.type === "Polygon")
      return f.geometry.coordinates[0].map(
        ([lng, lat]) => [lat, lng] as [number, number],
      );
    if (f.geometry.type === "MultiPolygon")
      return f.geometry.coordinates
        .flat(2)
        .map(([lng, lat]) => [lat, lng] as [number, number]);
    return [];
  });
  return L.latLngBounds(coords);
}
