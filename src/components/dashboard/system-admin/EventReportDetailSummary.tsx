import Image from "next/image";
import { ReportSummary as ReportSummaryType } from "@/types/eventReport.type";
import React from "react";

type ReportStatus = "Pending" | "Approved" | "Rejected";

interface ReportSummaryProps {
  summary: ReportSummaryType;
  currentStatus?: ReportStatus;
}

export default function ReportSummaryCard({
  summary,
  currentStatus,
}: ReportSummaryProps) {
  const displayStatus = currentStatus ?? summary.status;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-(--secondary-color) text-base">
          Report Summary
        </h3>

        <div className="flex items-center gap-2">
          <p className="text-(--text-secondary) text-md">Status:</p>
          <StatusBadge status={displayStatus} />
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <SummaryRow
          icon={<PersonIcon />}
          label="Post by"
          value={summary.postBy}
        />
        <SummaryRow
          icon={<CalendarIcon />}
          label="Event Date"
          value={summary.eventDate.slice(0, 10)}
        />
        <SummaryRow
          icon={<LocationIcon />}
          label="Province"
          value={summary.province}
        />
        <SummaryRow
          icon={<PeopleIcon />}
          label="Capacity"
          value={
            summary.capacity === null ? "Unlimited" : String(summary.capacity)
          }
        />
        <SummaryRow icon={<TicketIcon />} label="Price" value={summary.price} />
      </div>
    </div>
  );
}

interface SummaryRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function SummaryRow({ icon, label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-500">
        <span className="w-4 h-4 shrink-0 text-(--text-secondary)">{icon}</span>
        <span className="text-(--secondary-color) font-medium">{label}</span>
      </div>
      <span className="text-(--secondary-color) font-medium text-right">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  const displayStatus = status || "Unknown";

  const colors: Record<string, string> = {
    Pending: "bg-orange-100 text-orange-500",
    Approved: "bg-teal-100 text-teal-600",
    Rejected: "bg-red-100 text-red-500",
  };

  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-medium ${colors[displayStatus] ?? "bg-gray-100 text-gray-500"}`}
    >
      {displayStatus}
    </span>
  );
}

//  Icons
function PersonIcon() {
  return (
    <Image
      src="/images/user.svg"
      alt="Person"
      width={16}
      height={16}
      className="w-4 h-4"
    />
  );
}

function CalendarIcon() {
  return (
    <Image
      src="/images/calendar-remove.svg"
      alt="Calendar"
      width={16}
      height={16}
      className="text-(--secondary-color) w-4 h-4"
    />
  );
}

function LocationIcon() {
  return (
    <Image
      src="/images/location.svg"
      alt="Location"
      width={16}
      height={16}
      className=" text-(--secondary-color) w-4 h-4"
    />
  );
}

function PeopleIcon() {
  return (
    <Image
      src="/images/profile-2user.png"
      alt="People"
      width={16}
      height={16}
      className="text-(--secondary-color) w-4 h-4"
    />
  );
}

function TicketIcon() {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
      />
    </svg>
  );
}
