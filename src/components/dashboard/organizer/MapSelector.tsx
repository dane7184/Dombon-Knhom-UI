"use client"

import React, { useEffect, useRef, useState } from "react";
import { GeoJSON, MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import provincesJson from "@/data/map/khm_admin1.json";
import districtsJson from "@/data/map/khm_admin2.json";
import communesJson from "@/data/map/khm_admin3.json";
import { CommuneCollection, DistrictCollection, ProvinceCollection, } from "@/types/map.type";
import { baseStyle, selectedStyle } from "@/lib/Maputils";

const provinces = provincesJson as ProvinceCollection;
const districts = districtsJson as DistrictCollection;
const communes = communesJson as CommuneCollection;

export default function MapSelector({
    onSelectAction,
    onPinChangeAction,
    initial,
    initialPin,
}: {
    onSelectAction?: (sel: {
        province?: string;
        district?: string;
        commune?: string;
        lat?: number;
        lng?: number;
    }) => void;

    onPinChangeAction?: (pin: { lat: number; lng: number } | null) => void;

    initial?: {
        province?: string;
        district?: string;
        commune?: string;
    };

    initialPin?: { lat: number; lng: number } | null;
}) {
    const mapRef = useRef<L.Map | null>(null);

    const [province, setProvince] = useState<string | null>(initial?.province ?? null);
    const [district, setDistrict] = useState<string | null>(initial?.district ?? null);
    const [selectedCommune, setSelectedCommune] = useState<string | null>(initial?.commune ?? null);
    const [pin, setPin] = useState<{ lat: number; lng: number } | null>(initialPin ?? null);

    useEffect(() => {
        if (initial?.province !== province || initial?.district !== district || initial?.commune !== selectedCommune) {
            const isProvinceChange = province !== null && initial?.province !== null && province !== initial?.province;
            const isZoomOut = !isProvinceChange && ((selectedCommune && !initial?.commune) || (district && !initial?.district));

            setProvince(initial?.province ?? null);
            setDistrict(initial?.district ?? null);
            setSelectedCommune(initial?.commune ?? null);

            let featureToPan: any = null;
            let isProvinceZoom = false;
            if (initial?.commune && initial?.district) {
                featureToPan = communes.features.find((f: any) => f.properties.adm3_name === initial.commune && f.properties.adm2_name === initial.district);
            } else if (initial?.district && initial?.province) {
                featureToPan = districts.features.find((f: any) => f.properties.adm2_name === initial.district && f.properties.adm1_name === initial.province);
            } else if (initial?.province) {
                featureToPan = provinces.features.find((f: any) => f.properties.adm1_name === initial.province);
                isProvinceZoom = true;
            }

            if (featureToPan && mapRef.current) {
                const bounds = L.geoJSON(featureToPan).getBounds();
                const center = bounds.getCenter();

                // Set the pin to the center of the selected area if they select it via dropdown
                setPin({ lat: center.lat, lng: center.lng });
                onPinChangeAction?.({ lat: center.lat, lng: center.lng });

                if (isProvinceChange) {
                    mapRef.current.flyToBounds(bounds, { padding: [20, 20], duration: 1.5 });
                } else if (isZoomOut) {
                    mapRef.current.fitBounds(bounds, { padding: [20, 20], animate: true, duration: 2 });
                } else if (isProvinceZoom) {
                    mapRef.current.fitBounds(bounds, { padding: [20, 20], animate: true, duration: 0.8 });
                } else {
                    mapRef.current.fitBounds(bounds, { padding: [20, 20], animate: true, duration: 0.6 });
                }
            }
        }
    }, [initial?.province, initial?.district, initial?.commune]);

    useEffect(() => {
        setPin(initialPin ?? null);
    }, [initialPin?.lat, initialPin?.lng]);

    const handlePinChange = (nextPin: { lat: number; lng: number } | null) => {
        setPin(nextPin);
        onPinChangeAction?.(nextPin);
    };



    const selectProvince = (feature: any, latlng?: { lat: number; lng: number }) => {
        const nextProvince =
            feature.properties.adm1_name ||
            feature.properties.ADM1_EN ||
            undefined;

        if (!nextProvince) return;
        setProvince(nextProvince);
        setDistrict(null);
        setSelectedCommune(null);
        onSelectAction?.({
            province: nextProvince,
        });

        const bounds = L.geoJSON(feature as any).getBounds();

        if (latlng) {
            handlePinChange({ lat: latlng.lat, lng: latlng.lng });
        } else {
            const center = bounds.getCenter();
            handlePinChange({ lat: center.lat, lng: center.lng });
        }

        mapRef.current?.flyToBounds(bounds, {
            padding: [20, 20], duration: 0.8
        });
    };

    const onProvinceEach = (feature: any, layer: L.Layer) => {
        layer.bindTooltip(feature.properties?.adm1_name || "");

        layer.on("click", (e: any) => {
            selectProvince(feature, e.latlng);
        });
    };

    const selectDistrict = (feature: any, latlng?: { lat: number; lng: number }) => {
        const nextDistrict =
            feature.properties.adm2_name ||
            feature.properties.ADM2_EN ||
            undefined;
        const nextProvince =
            feature.properties.adm1_name ||
            feature.properties.ADM1_EN ||
            undefined;
        if (!nextDistrict) return;
        if (nextProvince) {
            setProvince(nextProvince);
        }
        setDistrict(nextDistrict);
        setSelectedCommune(null);
        onSelectAction?.({
            province: nextProvince,
            district: nextDistrict,
        });
        const bounds = L.geoJSON(feature as any).getBounds();

        if (latlng) {
            handlePinChange({ lat: latlng.lat, lng: latlng.lng });
        } else {
            const center = bounds.getCenter();
            handlePinChange({ lat: center.lat, lng: center.lng });
        }

        mapRef.current?.flyToBounds(bounds, {
            padding: [20, 20], duration: 1.2
        });
    };

    const onDistrictEach = (feature: any, layer: L.Layer) => {
        layer.bindTooltip(feature.properties?.adm2_name || "");

        layer.on("click", (e: any) => {
            selectDistrict(feature, e.latlng);
        });
    };
    const selectCommune = (feature: any, latlng?: { lat: number; lng: number }) => {
        const nextCommune =
            feature.properties.adm3_name ||
            feature.properties.ADM3_EN ||
            undefined;
        const nextDistrict =
            feature.properties.adm2_name ||
            feature.properties.ADM2_EN ||
            undefined;
        const nextProvince =
            feature.properties.adm1_name ||
            feature.properties.ADM1_EN ||
            undefined;

        if (!nextCommune) return;
        if (nextProvince) {
            setProvince(nextProvince);
        }
        if (nextDistrict) {
            setDistrict(nextDistrict);
        }
        setSelectedCommune(nextCommune);
        onSelectAction?.({
            province: nextProvince,
            district: nextDistrict,
            commune: nextCommune,
        });

        const bounds = L.geoJSON(feature as any).getBounds();

        if (latlng) {
            handlePinChange({ lat: latlng.lat, lng: latlng.lng });
        } else {
            const center = bounds.getCenter();
            handlePinChange({ lat: center.lat, lng: center.lng });
        }

        mapRef.current?.fitBounds(bounds, {
            padding: [20, 20], animate: true, duration: 0.4
        });
    };

    const onCommuneEach = (feature: any, layer: L.Layer) => {
        layer.bindTooltip(feature.properties?.adm3_name || "");

        layer.on("click", (e: any) => {
            selectCommune(feature, e.latlng);
        });
    };

    const districtFeatures = province
        ? districts.features.filter(
            (f) => f.properties.adm1_name === province
        )
        : [];

    const communeFeatures = district
        ? communes.features.filter(
            (f) => f.properties.adm2_name === district
        )
        : [];

    return (
        <div className="w-full h-full">
            <MapContainer
                ref={mapRef}
                center={[12, 105]}
                zoom={7}
                className="w-full h-full relative"
                zoomControl={true}
                maxBounds={[[10.0, 102.0], [15.0, 108.0]]}
                maxBoundsViscosity={1.0}
                minZoom={6}
            >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                <GeoJSON
                    key="province-layer"
                    data={provinces as any}
                    style={(feature) =>
                        feature?.properties?.adm1_name === province
                            ? { ...selectedStyle, weight: 3 }
                            : baseStyle
                    }
                    onEachFeature={onProvinceEach}
                />
                {province && !district && (
                    <GeoJSON
                        key={`district-layer-${province}`}
                        data={{
                            type: "FeatureCollection",
                            features: districtFeatures,
                        } as any}
                        style={(feature) =>
                            feature?.properties?.adm2_name === district
                                ? { ...selectedStyle, weight: 3 }
                                : baseStyle
                        }
                        onEachFeature={onDistrictEach}
                    />
                )}
                {province && district && (
                    <>
                        <GeoJSON
                            key={`commune-layer-${district}`}
                            data={{
                                type: "FeatureCollection",
                                features: communeFeatures,
                            } as any}
                            style={(feature) =>
                                feature?.properties?.adm3_name === selectedCommune
                                    ? {
                                        ...selectedStyle,
                                        weight: 3,
                                        fillOpacity: 0.15,
                                    }
                                    : baseStyle
                            }
                            onEachFeature={onCommuneEach}
                        />
                        {/* Removed redundant ClickHandler and markerPos */}
                    </>
                )}
                {pin && (
                    <Marker
                        position={[pin.lat, pin.lng]}
                        icon={L.divIcon({
                            className: "",
                            html: selectedCommune ? `
                                <div style="position: relative; width: 40px; height: 50px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end;">
                                    <img src="/icons/location.svg" style="width: 36px; height: 36px; pointer-events: none; margin-bottom: -6px; z-index: 20; position: relative;" />
                                    <div style="width: 16px; height: 16px; background: #18abc6; border: 3px solid white; border-radius: 9999px; box-shadow: 0 6px 14px rgba(24,171,198,0.35); position: relative; z-index: 10;"></div>
                                </div>
                            ` : `
                                <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
                                    <div style="width: 16px; height: 16px; background: #18abc6; border: 3px solid white; border-radius: 9999px; box-shadow: 0 6px 14px rgba(24,171,198,0.35); position: relative; z-index: 10;"></div>
                                </div>
                            `,
                            iconSize: selectedCommune ? [40, 50] : [22, 22],
                            iconAnchor: selectedCommune ? [20, 42] : [11, 11],
                        })}
                        interactive={false}
                    />
                )}
            </MapContainer>
        </div>
    );
}