"use client";

import { useState } from "react";

export type EventAppStatus = 'Published' | 'Pending' | 'Rejected';

export const STATUS_LABELS: Record<EventAppStatus, string> = {
    Published: 'Published',
    Pending: 'Pending',
    Rejected: 'Rejected',
};

interface FilterEventComponentProps {
    value?: EventAppStatus;
    onChange?: (status: EventAppStatus) => void;
}

export default function FilterEventComponent({ value, onChange }: FilterEventComponentProps) {
    const [internalActive, setInternalActive] = useState<EventAppStatus>('Published');
    const active = value ?? internalActive;

    const handleSelect = (status: EventAppStatus) => {
        if (!value) setInternalActive(status);
        onChange?.(status);
    };

    const getTabClass = (tab: EventAppStatus) =>
        `${active === tab ? "bg-white text-(--secondary-color) shadow" : "text-white hover:bg-white/10"}
        flex-1 sm:flex-none sm:px-6 py-2 flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-all cursor-pointer`;

    return (
        <div className="flex items-center gap-1 bg-(--main-color) rounded-lg w-full sm:w-auto p-1.5">
            {(Object.keys(STATUS_LABELS) as EventAppStatus[]).map((status) => (
                <button
                    key={status}
                    type="button"
                    onClick={() => handleSelect(status)}
                    className={getTabClass(status)}
                >
                    {STATUS_LABELS[status]}
                </button>
            ))}
        </div>
    );
}