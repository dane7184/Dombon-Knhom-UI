import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft2 } from "iconsax-react";
import provincesJson from "@/data/map/khm_admin1.json";
import districtsJson from "@/data/map/khm_admin2.json";
import communesJson from "@/data/map/khm_admin3.json";
import Image from "next/image";
import { CommuneCollection, DistrictCollection, ProvinceCollection } from "@/types/map.type";

const provincesData = provincesJson as ProvinceCollection;
const districtsData = districtsJson as DistrictCollection;
const communesData = communesJson as CommuneCollection;

import dynamic from "next/dynamic";
const MapSelector = dynamic(() => import("@/components/dashboard/organizer/MapSelector"), { ssr: false });

type DropdownFieldProps = {
    label: string;
    value: string;
    placeholder: string;
    options: string[];
    disabled?: boolean;
    onChange: (value: string) => void;
    onOpen?: () => void;
    error?: string;
};

function DropdownField({ label, value, placeholder, options, disabled, onChange, onOpen, error }: DropdownFieldProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = search
        ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
        : options;

    return (
        <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-semibold secondary-color flex items-center gap-2">
                {label}
            </label>
            <div ref={dropdownRef} className="relative">
                <div
                    className={`w-full h-10.5 border rounded-md px-4 outline-none text-sm text-des bg-white flex items-center justify-between gap-3 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${error ? "border-rose-400 focus-within:border-rose-500" : "border-(--input-border) focus-within:border-main-color"}`}
                    onClick={() => {
                        if (disabled) return;
                        setIsOpen(true);
                        onOpen?.();
                        setTimeout(() => inputRef.current?.focus(), 0);
                    }}
                >
                    <input
                        ref={inputRef}
                        type="text"
                        disabled={disabled}
                        value={isOpen ? search : (value || "")}
                        placeholder={value || placeholder}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            if (!isOpen) setIsOpen(true);
                        }}
                        onFocus={() => {
                            if (!disabled) {
                                setIsOpen(true);
                                setSearch("");
                                onOpen?.();
                            }
                        }}
                        className="min-w-0 flex-1 bg-transparent border-none outline-none p-0 text-sm text-des placeholder:text-[#94a3b8] disabled:cursor-not-allowed"
                    />
                    <ArrowLeft2 size={16} className={`shrink-0 -rotate-90 text-des pointer-events-none transition-transform ${isOpen ? "rotate-90" : ""}`} color="currentColor" />
                </div>

                {isOpen && !disabled && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-auto rounded-md border border-(--input-border) bg-white shadow-lg">
                        {filtered.length > 0 ? (
                            filtered.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => {
                                        onChange(option);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    className={`w-full px-4 py-3 text-left text-sm cursor-pointer transition-colors hover:bg-[#f1f5f9] ${option === value ? "text-(--main-color) font-semibold bg-[#f0fafb]" : "text-des"}`}
                                >
                                    {option}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-[#94a3b8]">No results found</div>
                        )}
                    </div>
                )}
            </div>
            {error && (
                <div className="absolute top-full left-0 mt-0.5 px-1">
                    <span className="text-[10px] text-rose-500 font-medium">{error}</span>
                </div>
            )}
        </div>
    );
}

export default function Step4Location({ initial = {}, onChange }: { initial?: { province?: string; district?: string; commune?: string; pin?: { lat: number; lng: number } | null; specificAddr?: string }, onChange?: (v: { province?: string; district?: string; commune?: string; pin?: { lat: number; lng: number } | null; specificAddr?: string }) => void }) {
    const [selectedProvince, setSelectedProvince] = useState(initial.province ?? "");
    const [selectedDistrict, setSelectedDistrict] = useState(initial.district ?? "");
    const [selectedCommune, setSelectedCommune] = useState(initial.commune ?? "");
    const [selectedSpecificAddr, setSelectedSpecificAddr] = useState(initial.specificAddr ?? "");
    const [selectedPin, setSelectedPin] = useState<{ lat: number; lng: number } | null>(initial.pin ?? null);
    const [touched, setTouched] = useState({
        province: false,
        district: false,
        commune: false,
        specificAddr: false,
    });

    useEffect(() => {
        onChange?.({ province: selectedProvince, district: selectedDistrict, commune: selectedCommune, pin: selectedPin, specificAddr: selectedSpecificAddr });
    }, [selectedProvince, selectedDistrict, selectedCommune, selectedPin, selectedSpecificAddr]);

    const provinceOptions = useMemo(
        () => provincesData.features.map((feature) => feature.properties.adm1_name),
        [],
    );

    const districtOptions = useMemo(() => {
        if (!selectedProvince) return [];

        return Array.from(
            new Set(
                districtsData.features
                    .filter((feature) => feature.properties.adm1_name === selectedProvince)
                    .map((feature) => feature.properties.adm2_name),
            ),
        );
    }, [selectedProvince]);

    const communeOptions = useMemo(() => {
        if (!selectedDistrict) return [];

        return Array.from(
            new Set(
                communesData.features
                    .filter((feature) => feature.properties.adm2_name === selectedDistrict)
                    .map((feature) => feature.properties.adm3_name),
            ),
        );
    }, [selectedDistrict]);

    const handleProvinceChange = (value: string) => {
        setSelectedProvince(value);
        setSelectedDistrict("");
        setSelectedCommune("");
    };

    const handleDistrictChange = (value: string) => {
        setSelectedDistrict(value);
        setSelectedCommune("");
    };

    const handleCommuneChange = (value: string) => {
        setSelectedCommune(value);
    };

    return (
        <div className="flex flex-col gap-6 w-full flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DropdownField
                    label="Selected Province"
                    value={selectedProvince}
                    placeholder="Province"
                    options={provinceOptions}
                    onChange={handleProvinceChange}
                    onOpen={() => setTouched((t) => ({ ...t, province: true }))}
                    error={touched.province && !selectedProvince ? "Province is required." : undefined}
                />

                <DropdownField
                    label="Selected District"
                    value={selectedDistrict}
                    placeholder="District"
                    options={districtOptions}
                    disabled={!selectedProvince}
                    onChange={handleDistrictChange}
                    onOpen={() => setTouched((t) => ({ ...t, district: true }))}
                    error={touched.district && !selectedDistrict ? "District is required." : undefined}
                />

                <DropdownField
                    label="Selected Commune"
                    value={selectedCommune}
                    placeholder="Commune"
                    options={communeOptions}
                    disabled={!selectedDistrict}
                    onChange={handleCommuneChange}
                    onOpen={() => setTouched((t) => ({ ...t, commune: true }))}
                    error={touched.commune && !selectedCommune ? "Commune is required." : undefined}
                />
            </div>

            <div className="flex flex-col gap-2 w-full">
                <label className="text-sm font-semibold secondary-color flex items-center gap-2">
                    Specific Address
                </label>
                <div className="relative flex flex-col w-full">
                    <input
                        type="text"
                        maxLength={255}
                        value={selectedSpecificAddr}
                        onChange={(e) => setSelectedSpecificAddr(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, specificAddr: true }))}
                        placeholder="e.g. Near Somdach Ouv Highschool, St 123..."
                        className={`w-full h-10.5 border rounded-md px-4 outline-none focus:border-main-color text-sm text-des bg-white ${
                            (selectedSpecificAddr.length > 0 && selectedSpecificAddr.length < 10) || (touched.specificAddr && selectedSpecificAddr.length === 0)
                                ? "border-rose-400 focus:border-rose-500"
                                : "border-(--input-border)"
                        }`}
                    />
                    <div className="absolute top-full left-0 right-0 flex justify-between w-full px-1 mt-0.5">
                        <span className="text-[10px] text-rose-500">
                            {selectedSpecificAddr.length > 0 && selectedSpecificAddr.length < 10
                                ? "Specific address must be at least 10 characters."
                                : touched.specificAddr && selectedSpecificAddr.length === 0
                                    ? "Specific address is required."
                                    : ""}
                        </span>
                    </div>
                </div>
            </div>

            <div className="relative z-0 w-full h-64 rounded-2xl overflow-hidden border border-(--input-border) mt-2 bg-[#f8fafc] flex items-center justify-center shadow-sm">
                <div className="w-full h-full">
                    <MapSelector onSelectAction={(sel) => {
                        setSelectedProvince(sel.province || "");
                        setSelectedDistrict(sel.district || "");
                        setSelectedCommune(sel.commune || "");
                    }} onPinChangeAction={setSelectedPin} initial={{province: selectedProvince, district: selectedDistrict, commune: selectedCommune}} initialPin={selectedPin} />
                </div>
            </div>
        </div>
    );
}