"use client";

import React from "react";
import {ArrowRight2, Calendar, Location} from "iconsax-react";
import Image from "next/image";
import Link from "next/link";
import {UpcomingEventResponse} from "@/types/event.type";
import {resolveUrl} from "@/lib/format";
import {CATEGORY_CONFIG, resolveCategoryKey} from "@/constant/category.config";

export interface EventsSidebarProps {
    upcomingEvent: UpcomingEventResponse[];
}

function formatDate(date: Date) {
    const newDate = new Date(date);
    const mm = new Intl.DateTimeFormat('en-US', {month: 'short'}).format(date);

    return `${mm} ${newDate.getDate()}, ${newDate.getFullYear()}`;
}

export default function EventsSidebar({upcomingEvent}: EventsSidebarProps) {
    return (
        <aside className="flex flex-col gap-6 w-full">
            <div
                className="bg-[var(--background-white)] rounded-xl card-shadow border border-[var(--input-border)] flex flex-col gap-4 h-full pb-5">
                <div className="flex justify-between items-center pt-4 pl-4">
                    <h3 className="text-sm font-bold text-[var(--text-main)] tracking-tight">
                        Upcoming Event
                    </h3>
                    <Link
                        href="/home/list?range=upcoming"
                        className="text-xs sm:text-sm font-normal text-gray-700 flex items-center hover:text-[var(--main-color)] transition group pr-4"
                    >
                        <span>View more</span>
                        <ArrowRight2
                            size={12}
                            color="currentColor"
                            className="transition-transform group-hover:translate-x-0.5"
                        />
                    </Link>
                </div>

                <div className="flex flex-col ">
                    {upcomingEvent.map((ue) => {
                        const isFree = ue.price === 0;
                        const displayPrice = isFree ? "Free" : `$${ue.price}`;
                        const configKey = resolveCategoryKey(ue.categoryName || "Other");
                        const config = CATEGORY_CONFIG[configKey];
                        const CategoryIcon = config.icon;
                        
                        return (
                            <Link
                                href={`/events/${ue.eventId}`}
                                key={ue.eventId}
                                className="flex gap-3 items-start border-b border-[var(--background-gray)] last:border-none last:pb-0 hover:bg-gray-50/50 rounded-xl transition-colors p-4 pb-4 -m-1 "
                            >
                                <div className="w-17 h-17 shrink-0">
                                    <Image
                                        src={resolveUrl(ue.image)}
                                        alt={ue.title}
                                        width={100}
                                        height={100}
                                        className="w-full h-full rounded-xl bg-[var(--background-color)] border border-[var(--input-border)] shadow-sm flex items-center justify-center text-xl object-cover"
                                    />
                                </div>

                                <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                                    <div className="flex justify-between items-start gap-1">
                                        <h4 className="text-sm font-bold text-[var(--text-main)] truncate">
                                            {ue.title}
                                        </h4>
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-bold rounded-full tracking-widest uppercase shrink-0"
                                            style={{
                                                backgroundColor: config.bg,
                                                borderColor: config.color,
                                                color: config.color,
                                            }}
                                        >
                                            <CategoryIcon size={12} strokeWidth={2.5} />
                                            {ue.categoryName}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Calendar
                                            size={15}
                                            color="var(--main-color)"
                                            variant="Outline"
                                            className="shrink-0"
                                        />
                                        <p className="text-xs text-[var(--text-desc)] font-inter flex items-center gap-1">
                                            {formatDate(new Date(ue.startAt))}
                                            {" - "}
                                            {formatDate(new Date(ue.endAt))}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center mt-1">
                                        <div className="flex items-center gap-1 min-w-0 flex-1">
                                            <Location
                                                size={15}
                                                color="var(--main-color)"
                                                variant="Outline"
                                                className="shrink-0"
                                            />
                                            <span className="text-xs text-[var(--text-secondary)] truncate">
                                                {(ue.province || ue.location?.province || "Unknown Location").replace(/_/g, " ")}
                                            </span>
                                        </div>

                                        <div
                                            className={`px-1.5 w-[50px] py-0.5 rounded-lg text-[12px] font-semibold shadow-sm text-center backdrop-blur-sm shrink-0 ${
                                                isFree
                                                    ? "bg-[#E8F7FA] text-[var(--main-color)]"
                                                    : "bg-[#ffeaf0] text-[var(--accent-color)]"
                                            }`}
                                        >
                                            {displayPrice}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
