"use client";

import React, { useEffect } from "react";
import { Trash } from "iconsax-react";
import { X } from "lucide-react";

interface DeleteConfirmPopupProps {
  isOpen: boolean;
  isClose: () => void;
  displayName: string;
  onConfirm: () => void;
}

export default function DeleteConfirmPopup({
  isOpen,
  isClose,
  displayName,
  onConfirm,
}: DeleteConfirmPopupProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") isClose();
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, isClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    isClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && isClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in slide-in-from-bottom-6 duration-300">
        <div className="relative flex flex-col items-center p-7 text-center">
          <button
            type="button"
            onClick={isClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="h-14 w-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
            <Trash size={26} color="currentColor" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-(--secondary-color)">
            Delete {displayName}?
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-[#7886a6]">
            This action cannot be undone. Are you sure you want to permanently
            delete{" "}
            <span className="font-semibold text-(--secondary-color)">{displayName}</span>?
          </p>

          <div className="mt-6 flex gap-3 w-full">
            <button
              onClick={isClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
