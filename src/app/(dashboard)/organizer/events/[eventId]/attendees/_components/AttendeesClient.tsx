// src/app/(dashboard)/organizer/events/[eventId]/attendees/_components/AttendeesClient.tsx
"use client";

import React from "react";


import { exportEventAttendees } from "@/services/event.service";

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
}

export const AttendeesClient: React.FC<Props> = ({ eventId, eventTitle, attendees }) => {
  const [isExporting, setIsExporting] = React.useState(false);

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">

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

      <h2 className="text-2xl font-semibold mb-4">Attendees for "{eventTitle}"</h2>

      {attendees.length === 0 ? (
        <p className="text-sm text-slate-400">No attendees registered.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="min-w-full table-auto">
            <thead className="bg-(--background-white)">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Full Name</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Email</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Checked In At</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((a) => (
                <tr key={a.userId} className="border-t border-slate-100 hover:bg-(--background-gray)">
                  <td className="px-4 py-2 text-slate-700">{a.fullName}</td>
                  <td className="px-4 py-2 text-slate-700">{a.email}</td>
                  <td className="px-4 py-2 text-slate-700">
                    {a.checkInAt ? new Date(a.checkInAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
