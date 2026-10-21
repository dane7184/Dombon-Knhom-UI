import { Feature, FeatureCollection, Geometry } from "geojson";

export type ProvinceProps = { adm1_name: string };
export type DistrictProps = { adm1_name: string; adm2_name: string };
export type CommuneProps = { adm2_name: string; adm3_name: string };

export type ProvinceFeature = Feature<Geometry, ProvinceProps>;
export type DistrictFeature = Feature<Geometry, DistrictProps>;
export type CommuneFeature = Feature<Geometry, CommuneProps>;

export type ProvinceCollection = FeatureCollection<Geometry, ProvinceProps>;
export type DistrictCollection = FeatureCollection<Geometry, DistrictProps>;
export type CommuneCollection = FeatureCollection<Geometry, CommuneProps>;

export type DrillLevel = "province" | "district" | "commune";

export interface MapSelection {
  province: string | null;
  district: string | null;
  commune: string | null;
}

export type OnSelectWithGeometry = (name: string, geometry: Geometry) => void;
