"use client";
import React, { useEffect } from "react";
import { X, Hash, DollarSign, Building2, Ticket, Calendar, DollarSignIcon, BadgeDollarSign, CircleDollarSign } from "lucide-react";
import { DollarCircle, Money } from "iconsax-react";

// Adjust this to match the shape of the row data from your table
export interface PaymentDetail {
  no: number;
  user: string;
  amount: string;
  organizer: string;
  event: string;
  date: string;
}

function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-25 h-25 rounded-full overflow-hidden border-4 border-white shadow-sm">
      <div className="w-full h-full bg-(--main-color)/15 flex items-center justify-center text-(--main-color) text-4xl font-bold">
        {initials}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  valueNode,
}: {
  icon: React.ReactNode;
  label: string;
  valueNode: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-[#4c4b4b]">{icon}</span>
        <span className="text-md text-[#4c4b4b]">{label}</span>
      </div>
      <div className="text-md font-semibold text-(--secondary-color) text-right truncate">
        {valueNode}
      </div>
    </div>
  );
}

interface PaymentDetailPopUpProps {
  isOpen: boolean;
  isClose: () => void;
  detail: PaymentDetail | null;
  loading?: boolean;
}

export default function PaymentDetailPopUp({
  isOpen,
  isClose,
  detail,
}: PaymentDetailPopUpProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") isClose();
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, isClose]);

  if (!isOpen) return null;
  if (!detail) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && isClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-md overflow-hidden w-132.5"
        style={{ animation: "deletePopupIn 0.18s ease" }}
      >
        <style>{`
          @keyframes deletePopupIn {
            from { opacity: 0; transform: scale(0.95) translateY(8px); }
            to   { opacity: 1; transform: scale(1)    translateY(0); }
          }
        `}</style>

        {/* CLOSE */}
        <div className="relative">
          <button
            type="button"
            onClick={isClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* AVATAR */}
          <div className="flex flex-col items-center pt-15 pb-5 px-10">
            <AvatarFallback name={detail.user} />
            <h2 className="mt-2 text-center text-xl font-bold text-(--secondary-color)">
              {detail.user}
            </h2>
            <span className="mt-4 text-3xl text-(--accent-color) font-semibold">
              {detail.amount}
            </span>
            <div className="w-full mt-4 border-t border-gray-100" />
          </div>
        </div>

        {/* BODY */}
        <div className="px-7 pb-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-bold text-(--secondary-color)">
              Transaction Information
            </h3>
          </div>

          <InfoRow icon={<Hash size={20} color="var(--main-color)" />} label="No" valueNode={detail.no} />
          <InfoRow
            icon={<CircleDollarSign size={20} color="var(--main-color)" />}
            label="Amount"
            valueNode={detail.amount}
          />
          <InfoRow
            icon={<Building2 size={20} color="var(--main-color)" />}
            label="Organizer"
            valueNode={detail.organizer}
          />
          <InfoRow
            icon={<Ticket size={20} color="var(--main-color)" />}
            label="Event"
            valueNode={detail.event}
          />
          <InfoRow
            icon={<Calendar size={20} color="var(--main-color)" />}
            label="Date"
            valueNode={detail.date}
          />    
        </div>
      </div>
    </div>
  );
}