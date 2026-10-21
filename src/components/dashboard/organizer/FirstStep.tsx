import React from "react";
import { ArrowLeft2, Calendar, FavoriteChart, Keyboard, User } from "iconsax-react";
import Image from "next/image";
import { CATEGORY_CONFIG } from "@/constant/category.config";
import type { AppBaseCategoryType } from "@/types/common.type";

const categories = Object.keys(CATEGORY_CONFIG) as AppBaseCategoryType[];

export interface Step1Data {
    title?: string;
    category?: string;
    capacity?: number | "";
    startDate?: string;
    endDate?: string;
    description?: string;
}

export default function Step1BasicInfo({
    initial = {},
    onChange,
}: {
    initial?: Step1Data;
    onChange?: (data: Step1Data) => void;
}) {
    const [title, setTitle] = React.useState(initial.title ?? "");
    const [category, setCategory] = React.useState(initial.category ?? "");
    const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);
    const [categorySearch, setCategorySearch] = React.useState("");
    const [capacity, setCapacity] = React.useState<number | "">(initial.capacity ?? "");
    const [capacityError, setCapacityError] = React.useState(false);
    const [startDate, setStartDate] = React.useState(initial.startDate ?? "");
    const [endDate, setEndDate] = React.useState(initial.endDate ?? "");
    const [description, setDescription] = React.useState(initial.description ?? "");
    const [touched, setTouched] = React.useState({
        title: false,
        category: false,
        startDate: false,
        endDate: false,
        description: false,
    });
    const categoryRef = React.useRef<HTMLDivElement | null>(null);
    const categoryInputRef = React.useRef<HTMLInputElement | null>(null);
    const startDateRef = React.useRef<HTMLInputElement | null>(null);
    const endDateRef = React.useRef<HTMLInputElement | null>(null);

    const getTomorrowString = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };
    const tomorrowStr = getTomorrowString();

    const openDatePicker = (input: HTMLInputElement | null) => {
        if (!input) return;
        input.focus();
        if (typeof input.showPicker === "function") {
            input.showPicker();
            return;
        }
        input.click();
    };

    React.useEffect(() => {
        if (startDate && endDate && endDate < startDate) {
            setEndDate("");
        }
    }, [startDate, endDate]);

    React.useEffect(() => {
        onChange?.({ title, category, capacity, startDate, endDate, description });
    }, [title, category, capacity, startDate, endDate, description]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false);
                setCategorySearch("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col gap-5 pb-4.5">
            <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-semibold secondary-color flex items-center gap-2">
                    <Keyboard size={20} className="text-des" color="currentColor" />Title
                </label>
                <input
                    type="text"
                    placeholder="Enter title"
                    value={title}
                    onChange={(e) => {
                        const text = e.target.value;
                        const hasInvalidLongWord = text.split(/\s+/).some(word => word.length > 25 && !word.startsWith("http"));
                        if (text.length <= 100 && !hasInvalidLongWord) {
                            setTitle(text);
                        }
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, title: true }))}
                    className={`w-full h-10.5 border rounded-md px-3 outline-none text-xs text-des placeholder:text-[#94a3b8] transition-colors ${title.length > 0 && title.length < 10 ? 'border-[var(--accent-color)] focus:border-[var(--accent-color)]' : title.length === 100 ? 'border-red-500 focus:border-red-500' : 'border-(--input-border) focus:border-main-color'}`}
                />
                <div className="absolute top-full left-0 right-0 flex justify-between items-center mt-0.5 px-1">
                    {title.length > 0 && title.length < 10 ? (
                        <span className="text-[var(--accent-color)] text-[10px] font-medium">Title must be at least 10 characters</span>
                    ) : title.length === 100 ? (
                        <span className="text-red-500 text-[10px] font-medium">Maximum 100 characters reached</span>
                    ) : touched.title && title.trim().length === 0 ? (
                        <span className="text-red-500 text-[10px] font-medium">Title is required.</span>
                    ) : touched.title && title.trim().length < 10 ? (
                        <span className="text-red-500 text-[10px] font-medium">Title must be at least 10 characters.</span>
                    ) : null}
                    <span className={`text-[10px] ml-auto ${title.length === 100 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        {title.length}/100
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-semibold secondary-color flex items-center gap-2">
                        <Image src="/icons/element-plus.svg" alt="Element" width={20} height={20} />Category
                    </label>
                    <div ref={categoryRef} className="relative">
                        <div
                            className={`w-full h-10.5 overflow-hidden border rounded-md px-3 outline-none text-xs text-des bg-white cursor-pointer flex items-center justify-between gap-3 whitespace-nowrap ${touched.category && !category ? "border-red-500 focus-within:border-red-500" : "border-(--input-border) focus-within:border-main-color"}`}
                            onClick={() => {
                                setIsCategoryOpen(true);
                                setTouched((t) => ({ ...t, category: true }));
                                setTimeout(() => categoryInputRef.current?.focus(), 0);
                            }}
                        >
                            <input
                                ref={categoryInputRef}
                                type="text"
                                value={isCategoryOpen ? categorySearch : (category || "")}
                                placeholder={category || "Select category"}
                                onChange={(e) => {
                                    setCategorySearch(e.target.value);
                                    if (!isCategoryOpen) setIsCategoryOpen(true);
                                }}
                                onFocus={() => {
                                    setIsCategoryOpen(true);
                                    setCategorySearch("");
                                    setTouched((t) => ({ ...t, category: true }));
                                }}
                                className={`min-w-0 flex-1 bg-transparent border-none outline-none p-0 text-xs text-des placeholder:text-[#94a3b8] ${category && !isCategoryOpen ? "text-current" : ""}`}
                            />
                            <ArrowLeft2 size={20} className={`shrink-0 -rotate-90 transition-transform pointer-events-none ${isCategoryOpen ? "rotate-90" : ""}`} color="currentColor" />
                        </div>

                        {isCategoryOpen && (() => {
                            const filtered = categorySearch
                                ? categories.filter((cat) => cat.toLowerCase().includes(categorySearch.toLowerCase()))
                                : categories;
                            return (
                                <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-y-auto overscroll-contain rounded-md border border-(--input-border) bg-white shadow-lg scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                                    {filtered.length > 0 ? (
                                        filtered.map((cat) => {
                                            const config = CATEGORY_CONFIG[cat];
                                            const IconComponent = config.icon;

                                            return (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => {
                                                        setCategory(cat);
                                                        setIsCategoryOpen(false);
                                                        setCategorySearch("");
                                                    }}
                                                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs cursor-pointer transition-colors hover:bg-[#f1f5f9] ${cat === category ? "text-(--main-color) font-semibold bg-[#f0fafb]" : "text-des"}`}
                                                >
                                                    <span
                                                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                                                        style={{ backgroundColor: config.bg, color: config.color }}
                                                    >
                                                        <IconComponent size={14} color="currentColor" />
                                                    </span>
                                                    <span className="truncate">{cat}</span>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="px-3 py-3 text-xs text-[#94a3b8]">No results found</div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                    {touched.category && !category && (
                        <div className="absolute top-full left-0 px-1">
                            <span className="text-red-500 text-[10px] font-medium">Category is required.</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-semibold secondary-color flex items-center gap-2">
                        <User size={20} className="text-des" color="currentColor" />Capacity (Optional)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            placeholder="Enter capacity"
                            value={capacity}
                            min={0}
                            max={100000}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (v === "") {
                                    setCapacity("");
                                    setCapacityError(false);
                                    return;
                                }
                                const n = Number(v);
                                if (Number.isNaN(n)) return;
                                if (n > 100000) {
                                    setCapacityError(true);
                                    return;
                                }
                                setCapacityError(false);
                                setCapacity(Math.max(0, Math.floor(n)));
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                                    e.preventDefault();
                                }
                            }}
                            onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                            className={`w-full h-10.5 border rounded-md px-3 outline-none text-xs text-des placeholder:text-[#94a3b8] transition-colors pr-10 ${capacityError ? 'border-red-500 focus:border-red-500' : 'border-(--input-border) focus:border-main-color'}`}
                        />
                        <User size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-des" color="currentColor" />
                    </div>
                    {capacityError && (
                        <div className="absolute top-full left-0 px-1 mt-0.5">
                            <span className="text-red-500 text-[10px] font-medium">Maximum capacity is 100,000.</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-semibold secondary-color flex items-center gap-2">
                        <Calendar size={20} className="text-des cursor-pointer" color="currentColor" />Start Date
                    </label>
                    <div className="relative">
                        <input
                            ref={startDateRef}
                            type="date"
                            value={startDate}
                            min={tomorrowStr}
                            max={endDate || undefined}
                            onChange={(e) => setStartDate(e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, startDate: true }))}
                            className={`w-full h-10.5 border rounded-md px-3 pr-11 outline-none focus:border-main-color text-xs text-des placeholder:text-[#94a3b8] appearance-none bg-white uppercase [&::-webkit-calendar-picker-indicator]:hidden ${touched.startDate && !startDate ? "border-red-500 focus:border-red-500" : "border-(--input-border)"}`}
                        />
                        <button
                            type="button"
                            onClick={() => openDatePicker(startDateRef.current)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-des cursor-pointer"
                            aria-label="Open start date picker"
                        >
                            <Calendar size={18} color="currentColor" />
                        </button>
                    </div>
                    {touched.startDate && !startDate && (
                        <div className="absolute top-full left-0 px-1">
                            <span className="text-red-500 text-[10px] font-medium">Start date is required.</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-semibold secondary-color flex items-center gap-2">
                        <Calendar size={20} className="text-des cursor-pointer" color="currentColor" />End Date
                    </label>
                    <div className="relative">
                        <input
                            ref={endDateRef}
                            type="date"
                            value={endDate}
                            min={startDate || tomorrowStr}
                            onChange={(e) => {
                                const nextValue = e.target.value;
                                if (startDate && nextValue && nextValue < startDate) {
                                    setEndDate("");
                                    return;
                                }

                                setEndDate(nextValue);
                            }}
                            onBlur={() => setTouched((t) => ({ ...t, endDate: true }))}
                            className={`w-full h-10.5 border rounded-md px-3 pr-11 outline-none focus:border-main-color text-xs text-des placeholder:text-[#94a3b8] appearance-none bg-white uppercase [&::-webkit-calendar-picker-indicator]:hidden ${touched.endDate && !endDate ? "border-red-500 focus:border-red-500" : "border-(--input-border)"}`}
                        />
                        <button
                            type="button"
                            onClick={() => openDatePicker(endDateRef.current)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-des cursor-pointer"
                            aria-label="Open end date picker"
                        >
                            <Calendar size={18} color="currentColor" />
                        </button>
                    </div>
                    {touched.endDate && !endDate && (
                        <div className="absolute top-full left-0 px-1">
                            <span className="text-red-500 text-[10px] font-medium">End date is required.</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-semibold secondary-color flex items-center gap-2">
                    <FavoriteChart size={20} className="text-des" color="currentColor" />Description
                </label>
                <textarea
                    placeholder="say something..."
                    value={description}
                    onChange={(e) => {
                        const text = e.target.value;
                        const hasInvalidLongWord = text.split(/\s+/).some(word => word.length > 25 && !word.startsWith("http"));
                        if (text.length <= 500 && !hasInvalidLongWord) {
                            setDescription(text);
                        }
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, description: true }))}
                    className={`w-full border rounded-md px-3 py-3 outline-none text-xs text-des placeholder:text-[#94a3b8] transition-colors h-[100px] resize-none ${touched.description && !description ? 'border-red-500 focus:border-red-500' : description.length === 500 ? 'border-red-500 focus:border-red-500' : 'border-(--input-border) focus:border-main-color'}`}
                />
                <div className="absolute top-full left-0 right-0 flex justify-between items-center mt-0.5 px-1">
                    {touched.description && !description ? (
                        <span className="text-red-500 text-[10px] font-medium">Description is required.</span>
                    ) : description.length === 500 ? (
                        <span className="text-red-500 text-[10px] font-medium">Maximum 500 characters reached</span>
                    ) : <span />}
                    <span className={`text-[10px] ml-auto ${description.length === 500 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        {description.length}/500
                    </span>
                </div>
            </div>

        </div>
    );
}