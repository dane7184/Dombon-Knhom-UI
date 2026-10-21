"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, X } from "lucide-react";

interface DeleteEventModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteEventModal({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteEventModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-sm rounded-2xl border-none bg-white p-0 shadow-xl data-[state=open]:slide-in-from-bottom-4"
        showCloseButton={false}
      >
        <div className="relative flex flex-col items-center p-7 text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Trash2 size={26} strokeWidth={2} />
          </div>

          <DialogTitle className="mt-5 text-xl font-bold text-(--secondary-color)">
            Delete Event
          </DialogTitle>

          <DialogDescription className="mt-2 text-sm leading-relaxed text-[#7886a6]">
            You&apos;re going to permanently remove this event. This action cannot be undone.
          </DialogDescription>

          <div className="mt-6 flex gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
