import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { JoinEventResult } from "@/types/event.type";

interface TicketModalProps {
  ticket: JoinEventResult;
  eventTitle: string;
  onClose: () => void;
}

export const TicketModal = ({ ticket, eventTitle, onClose }: TicketModalProps) => {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative animate-in fade-in slide-in-from-bottom-6 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colored header */}
        <div className="bg-(--main-color) px-6 pt-6 pb-8 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
            Your Ticket
          </p>
          <h2 className="text-white text-lg font-bold leading-snug line-clamp-2">
            {eventTitle}
          </h2>
        </div>

        {/* Tear effect */}
        <div className="flex items-center -mt-4 px-4">
          <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0 -ml-6" />
          <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
          <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0 -mr-6" />
        </div>

        {/* QR Code */}
        <div className="px-8 py-6 flex flex-col items-center gap-4">
          {ticket.ticketQr ? (
            <div className="w-52 h-52 rounded-2xl border-2 border-dashed border-(--main-color) bg-slate-50 flex items-center justify-center p-3">
              <Image
                src={`data:image/png;base64,${ticket?.ticketQr}`}
                alt="Ticket QR Code"
                width={180}
                height={180}
                className="rounded-lg object-contain"
              />
            </div>
          ) : (
            <div className="w-52 h-52 rounded-2xl bg-slate-100 flex items-center justify-center">
              <p className="text-sm text-[#7886a6]">QR unavailable</p>
            </div>
          )}
          <p className="text-xs text-[#7886a6] text-center leading-relaxed">
            Show this QR code at the entrance for check-in
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-center">
          <Image
            src="/images/Logo.png"
            alt="Platform Logo"
            width={100}
            height={28}
            className="object-contain opacity-60"
          />
        </div>
      </div>
    </div>
  );
};
