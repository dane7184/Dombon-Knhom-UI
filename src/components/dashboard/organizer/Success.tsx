"use client";

import React from "react";
import { X } from "lucide-react";
import { TickCircle } from "iconsax-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

type SuccessModalProps = {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    onCloseAction: () => void;
};

export default function SuccessModal({
    open,
    onOpenChangeAction,
    onCloseAction,
}: SuccessModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChangeAction}>
            <DialogContent
                className="max-w-sm rounded-2xl border-none bg-white p-0 shadow-xl data-[state=open]:slide-in-from-bottom-4"
                showCloseButton={false}
            >
                <div className="relative flex flex-col items-center p-7 text-center">
                    <button
                        type="button"
                        onClick={onCloseAction}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                        aria-label="Close dialog"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--main-color)/10 text-(--main-color)">
                        <TickCircle size={28} variant="Outline" color="currentColor" />
                    </div>

                    <DialogTitle className="mt-5 text-xl font-bold text-(--secondary-color)">
                        Request sent successfully!
                    </DialogTitle>

                    <DialogDescription className="mt-2 text-sm leading-relaxed text-[#7886a6]">
                        Your request has been created successfully!
                    </DialogDescription>

                    <button type="button" onClick={onCloseAction} className="btn-main mt-6 w-full py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 cursor-pointer transition-opacity">
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}