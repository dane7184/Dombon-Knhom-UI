import { Geometry, Position } from "geojson";

type Ring = Position[];

function pointInRing(lat: number, lng: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0] as number;
    const yi = ring[i][1] as number;
    const xj = ring[j][0] as number;
    const yj = ring[j][1] as number;
    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygon(
  lat: number,
  lng: number,
  coordinates: Position[][],
): boolean {
  const [outer, ...holes] = coordinates;
  if (!pointInRing(lat, lng, outer)) return false;
  for (const hole of holes) {
    if (pointInRing(lat, lng, hole)) return false;
  }
  return true;
}

export function pointInGeometry(
  lat: number,
  lng: number,
  geometry: Geometry,
): boolean {
  if (geometry.type === "Polygon") {
    return pointInPolygon(lat, lng, geometry.coordinates);
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((poly) => pointInPolygon(lat, lng, poly));
  }
  return false;
}
