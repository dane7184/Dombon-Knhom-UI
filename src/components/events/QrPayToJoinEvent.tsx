"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";

export default function QRModal() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Modal Box */}
      <div className="bg-white rounded-[15px] shadow-xl w-100 h-123.75 p-6 relative z-50 animate-in fade-in slide-in-from-bottom-6 duration-300">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* KHQR Logo */}
        <div className="text-center mb-1">
          <Image
            src={"/images/khqrLogo.png"}
            alt="KHQR Logo"
            width={90}
            height={40}
            className="mx-auto mt-4 mb-2"
          />
        </div>

        {/* Title */}
        <h2 className="text-center text-[18px] font-bold text-gray-800 mb-4">
          Scan to Pay
        </h2>

        {/* Amount */}
        <div className="text-center mb-5">
          <p className="text-sm">Total Amount</p>
          <p className="text-[18px] font-bold ">$100.00</p>
        </div>

        {/* QR Code Box */}
        <div className="border-2 w-60 h-60 m-auto border-dashed border-(--main-color) rounded-2xl p-4 flex items-center justify-center mb-4 bg-gray-50">
          <div className="relative">
            <Image
              src={"/images/qr.png"}
              alt="QR Code"
              width={220}
              height={220}
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Logo */}
        <div className="text-center">
          <Image
            src={"/images/Logo.png"}
            alt="Dombong Logo"
            width={120}
            height={30}
            className="mx-auto"
          />
        </div>
      </div>
    </div>
  );
}
