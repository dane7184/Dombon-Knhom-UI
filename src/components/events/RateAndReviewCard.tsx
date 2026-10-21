"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

type RatingModalProps = {
  isOpen?: boolean;
  onCloseAction?: () => void;
};

export default function RatingModal({ isOpen, onCloseAction }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [open, setOpen] = useState(true);

  const visible = isOpen ?? open;

  if (!visible) return null;

  const handleClose = () => {
    if (onCloseAction) {
      onCloseAction();
      return;
    }

    setOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-10 animate-in fade-in duration-200">
      {/* Modal Box */}
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative animate-in fade-in slide-in-from-bottom-6 duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Title */}
        <h2 className="text-xl mt-8 mb-2 font-bold text-(--secondary-color)">
          Rate Your Experience
        </h2>
        <p className="text-[#7886a6] text-sm mt-1 mb-8">
          How would you rate your experience on our website?
        </p>

        {/* Stars */}
        <div className="flex justify-center  gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star === rating ? star - 1 : star)}
              className={`flex justify-center items-center border border-gray-200 p-4 rounded-[8px] text-2xl cursor-pointer ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
            >
              <Image src={star <= rating ? "/images/starfill.svg" : "/images/Star.svg"} alt="Star" width={26} height={26} />
            </button>
          ))}
        </div>

        {/* Feedback Textarea */}
        <label className="block text-sm font-semibold text-(--secondary-color) mb-4">
          Tell us about your experience (optional)
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write your feedback here..."
          rows={6}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/10 mb-6"
        />

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button className="flex-1 py-3 rounded-xl text-sm font-semibold bg-(--main-color) hover:opacity-90 text-white cursor-pointer transition-opacity">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
