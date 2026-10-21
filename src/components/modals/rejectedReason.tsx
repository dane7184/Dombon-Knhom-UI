"use client";

import { useState } from "react";

interface RejectReasonModalProps {
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export default function RejectReasonModal({ onClose, onSubmit }: RejectReasonModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onSubmit(reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-7 shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-300">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-(--secondary-color)">Provide Your Reason</h2>
          <p className="mt-1.5 text-sm text-[#7886a6]">
            Please provide a reason why you reject the event.
          </p>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-(--secondary-color)">
            Tell them why you reject their submission
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Write your feedback here..."
            maxLength={250}
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/10"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-(--main-color) text-white hover:opacity-90 cursor-pointer transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
