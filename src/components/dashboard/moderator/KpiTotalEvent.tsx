"use client"

import {ModeratorKPI} from "@/types/moderator.type";
import {} from "iconsax-react";
import React from "react";
import Image from "next/image";

export default function KpiTotalEvent({totalOrg, totalReport, totalEvent} : ModeratorKPI) {
    return <div>
        <div className="w-full bg-white rounded-2xl h-40 box-shadow p-4 flex gap-60">
            <div>
                <div className="flex items-center gap-3 mt-5 ml-4">
                    <div className="w-5 h-5 min-w-6 min-h-6 bg-orange-200 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[var(--warning-color)]"></div>
                    </div>
                    <p className="text-(--color-ring) text-lg w-full">Total Event</p>
                </div>
                <h2 className="font-inter text-4xl font-bold mt-7 ml-4">{totalEvent}</h2>
            </div>
            <div className="bg-[var(--warning-color)] w-16 h-16 min-w-18 min-h-18 rounded-full flex items-center justify-center mt-7">
                <Image src="icons/CalendarIcon.svg" alt="Calendar" width={35} height={35} />
            </div>
        </div>
    </div>
}