import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  variant: "success" | "warning";
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmationModal({ isOpen, variant, onClose, onConfirm }: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 flex flex-col items-center text-center shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-300">

        {variant === "success" ? (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--main-color)/10 text-(--main-color)">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
        )}

        <h2 className="mt-5 text-xl font-bold text-(--secondary-color)">Are You Sure?</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#7886a6]">
          You are going to approve the report.
        </p>

        <div className="mt-6 flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-(--main-color) text-white hover:opacity-90 cursor-pointer transition-opacity"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
