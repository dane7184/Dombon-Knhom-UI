"use client";

import React from "react";
import { X } from "lucide-react";
import { MoneySend } from "iconsax-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

type WithdrawConfirmModalProps = {
    open: boolean;
    amount: string;
    isSubmitting?: boolean;
    onOpenChangeAction: (open: boolean) => void;
    onCancelAction: () => void;
    onConfirmAction: () => void;
};

export default function WithdrawConfirmModal({
    open,
    amount,
    isSubmitting = false,
    onOpenChangeAction,
    onCancelAction,
    onConfirmAction,
}: WithdrawConfirmModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChangeAction}>
            <DialogContent
                className="max-w-sm rounded-2xl border-none bg-white p-0 shadow-xl data-[state=open]:slide-in-from-bottom-4"
                showCloseButton={false}
            >
                <div className="relative flex flex-col items-center p-7 text-center">
                    <button
                        type="button"
                        onClick={onCancelAction}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                        aria-label="Close dialog"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                        <MoneySend size={26} variant="Linear" color="currentColor" />
                    </div>

                    <DialogTitle className="mt-5 text-xl font-bold text-(--secondary-color)">
                        Request withdraw
                    </DialogTitle>

                    <DialogDescription className="mt-2 text-sm leading-relaxed text-[#7886a6]">
                        Confirm ${amount}.00 withdrawal to{" "}
                        <span className="font-semibold text-(--secondary-color)">ABA Bank DARA CHHINCHHEANG?</span>
                    </DialogDescription>

                    <div className="mt-6 flex gap-3 w-full">
                        <button type="button" onClick={onCancelAction} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors">
                            Cancel
                        </button>
                        <button type="button" onClick={onConfirmAction} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-(--main-color) text-white hover:opacity-90 cursor-pointer transition-opacity">
                            Confirm
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}