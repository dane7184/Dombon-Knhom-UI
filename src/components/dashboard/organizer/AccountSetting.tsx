"use client";
import React from "react";
import DeleteOrganizerAccountModal from "./DeleteOrganizerAccountModal";
import { useOrganizationInfo } from "@/hooks/org/useOrganizationInfo";
import { resolveAvatarUrl } from "@/lib/format";
import Image from "next/image";

export default function AccountSettings() {
    const { infoOrg } = useOrganizationInfo();

    return (
        <div className="bg-white rounded-2xl box-shadow w-full p-5 md:p-6 lg:p-8 h-full">
            <div className="mb-6 border-b border-[#f3f3f3] pb-4">
                <h2 className="text-xl font-bold secondary-color">Account Setting</h2>
            </div>

            <div className="border border-[#e2e8f0] rounded-[20px] p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-[72px] h-[72px] rounded-full border-2 border-[#e2e8f0] flex items-center justify-center shrink-0 bg-white relative overflow-hidden">
                        <Image src={resolveAvatarUrl(infoOrg?.logo)} alt={infoOrg?.name || "Organizer"} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold secondary-color mb-1">
                            Delete Organizer Account
                        </h3>
                        <p className="text-[13px] text-des">
                            Delete your account permanently. Your all data will lost forever
                        </p>
                    </div>
                </div>

                <DeleteOrganizerAccountModal />
            </div>
        </div>
    );
}