import React from "react";
import { CheckCircle2, X } from "lucide-react";

interface ConfirmJoinModalProps {
  isFree: boolean;
  price: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmJoinModal = ({ isFree, price, onConfirm, onCancel }: ConfirmJoinModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xs" onClick={onCancel} />

      <div className="relative bg-white rounded-2xl p-7 max-w-sm w-full shadow-xl flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-6 duration-300">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--main-color)/10 text-(--main-color)">
          <CheckCircle2 size={26} strokeWidth={2} />
        </div>

        <h3 className="mt-5 text-xl font-bold text-(--secondary-color)">
          Confirm Registration
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-[#7886a6]">
          {isFree
            ? "This event is free. You'll receive a QR ticket after joining."
            : `This event costs $${price}. You'll be redirected to complete payment.`}
        </p>

        <div className="mt-6 flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-(--main-color) text-white hover:opacity-90 cursor-pointer transition-opacity"
          >
            {isFree ? "Join Now" : `Pay $${price}`}
          </button>
        </div>
      </div>
    </div>
  );
};
