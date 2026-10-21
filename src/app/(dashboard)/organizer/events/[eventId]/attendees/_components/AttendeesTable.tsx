// src/app/(dashboard)/organizer/events/[eventId]/attendees/_components/AttendeesTable.tsx
"use client";

import React from "react";
import { exportEventAttendees } from "@/services/event.service";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Attendee {
  userId: string;
  fullName: string;
  email: string;
  checkInAt: string | null;
}

interface Props {
  eventId: string;
  eventTitle: string;
  attendees: Attendee[];
  showBackButton?: boolean;
}

export const AttendeesTable: React.FC<Props> = ({ eventId, eventTitle, attendees, showBackButton }) => {
  const [isExporting, setIsExporting] = React.useState(false);
  const router = useRouter();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await exportEventAttendees(eventId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendees-${eventId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-background h-fit overflow-hidden flex flex-col">
      <div className="w-full mx-auto flex flex-col flex-1 min-h-0">
        <div className="bg-(--background-white) rounded-2xl border border-(--input-border) card-shadow overflow-hidden flex flex-col flex-1 min-h-0">
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-(--input-border) shrink-0">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex w-10 h-10 cursor-pointer items-center justify-center rounded-full hover:bg-slate-50 transition-colors border-none bg-transparent"
                >
                  <ArrowLeft size={26} color="#18ABC6" />
                </button>
              )}
              <div>
                <h1 className="text-lg font-bold text-(--secondary-color) leading-tight">
                  Attendees
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {eventTitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 font-medium">
                {attendees.length} {attendees.length === 1 ? "attendee" : "attendees"}
              </span>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[var(--main-color)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                )}
                Export
              </button>
            </div>
          </div>

          {/* ── Scrollable table (horizontal scroll on narrow screens) ── */}
          <div className="flex-1 min-h-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="min-w-[640px] flex flex-col h-full">
              {/* ── Column headers ── */}
              <div className="flex items-center gap-4 px-6 py-3 border-b border-(--input-border) bg-(--background-gray)/50 shrink-0">
                <div className="w-9 shrink-0" />
                <span className="flex-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Name
                </span>
                <span className="flex-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Email
                </span>
                <span className="w-32 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right shrink-0">
                  Checked In
                </span>
              </div>

              {/* ── Attendee rows ── */}
              <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {attendees.length === 0 ? (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-sm text-slate-400 font-medium">
                      No attendees registered
                    </p>
                  </div>
                ) : (
                  attendees.map((attendee, index) => (
                    <div
                      key={attendee.userId}
                      className={`flex items-center gap-4 px-6 py-4 border-b border-(--input-border) transition-colors hover:bg-(--background-gray) group ${
                        index % 2 === 0 ? "bg-white" : "bg-(--background-white)"
                      }`}
                    >
                      {/* Avatar circle with initials */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                        style={{
                          background: getAvatarColor(index),
                        }}
                      >
                        {getInitials(attendee.fullName)}
                      </div>

                      {/* Name */}
                      <p className="flex-1 text-sm font-semibold text-(--secondary-color) leading-relaxed truncate">
                        {attendee.fullName}
                      </p>

                      {/* Email */}
                      <p className="flex-1 text-sm text-(--text-secondary) leading-relaxed truncate">
                        {attendee.email}
                      </p>

                      {/* Check-in time */}
                      <div className="w-32 shrink-0 text-right">
                        {attendee.checkInAt ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {new Date(attendee.checkInAt).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            Not checked in
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Helpers ── */

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "#18ABC6",
  "#6366F1",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#06B6D4",
];

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}
