"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, X } from "lucide-react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {useDeleteAccount} from "@/hooks/org/useOrganizationInfo";

export default function DeleteOrganizerAccountModal() {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { deleteAccount, loading, error } = useDeleteAccount();



    const close = () => setOpen(false);

    const handleDelete = async () => {
        const ok = await deleteAccount();
        if (ok) {
            setOpen(false);
            router.push("/");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="bg-destructive cursor-pointer text-white px-6 py-3 w-full md:w-auto rounded-lg text-[15px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shrink-0">
                    <Trash2 size={18} color="white" />
                    Delete
                </button>
            </DialogTrigger>

            <DialogContent
                className="max-w-sm rounded-2xl border-none bg-white p-0 shadow-xl data-[state=open]:slide-in-from-bottom-4"
                showCloseButton={false}
            >
                <div className="relative flex flex-col items-center p-7 text-center">
                    <button
                        type="button"
                        onClick={close}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <AlertTriangle size={26} strokeWidth={2} />
                    </div>

                    <DialogTitle className="mt-5 text-xl font-bold text-(--secondary-color)">
                        Delete account
                    </DialogTitle>

                    <DialogDescription className="mt-2 text-sm leading-relaxed text-[#7886a6]">
                        Your account will be deleted permanently. Are you sure?
                    </DialogDescription>

                    {error && (
                        <p className="mt-3 text-xs text-red-500">{error}</p>
                    )}

                    <div className="mt-6 flex gap-3 w-full">
                        <button
                            type="button"
                            onClick={close}
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 cursor-pointer transition-colors disabled:opacity-50"
                        >
                            {loading ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}