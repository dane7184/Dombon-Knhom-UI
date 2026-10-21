// "use client"

import React from "react";
import Image from "next/image";
import { DollarCircle } from "iconsax-react";
import WithdrawForm from "./WithdrawForm";
import {currentBalance} from "@/types/organizer.type";

interface Props {
    data: currentBalance | null;
    error?: string | null;
}

export default function CurrentBalance({ data, error }: Props) {
    return (
        <div className="bg-white rounded-2xl p-6 card-shadow w-full flex flex-col relative overflow-hidden h-full">
            <div className="flex justify-between items-start z-10">
                <div>
                    <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">
                        Current Balance
                    </p>
                    <h2 className="text-3xl font-extrabold text-main tracking-tight">
                        {error ? "—" : `$${(data?.balance ?? 0).toLocaleString()}`}
                    </h2>
                </div>
                <div className="w-12 h-12 bg-[#22c55e] rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
                    <DollarCircle size={24} variant="Linear" color="#ffffff" />
                </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100 pointer-events-none z-0 text-[#22c55e]">
                <Image src="/icons/coin.svg" alt="Coin" width={300} height={300} />
            </div>

            <div className="mt-auto z-10 pt-16">
                <p className="text-[11px] text-[#94a3b8] mb-2 font-medium">
                    Withdrawal available immediately
                </p>
                <WithdrawForm balance={data?.balance ?? 0} />
            </div>
        </div>
    );
}