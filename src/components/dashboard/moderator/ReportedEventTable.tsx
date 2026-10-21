"use client";

import GenericSmallTableReportEvent, {
  type ColumnDef,
} from "../GenericSmallTableReportEvent";
import { ReportedEvent } from "@/types/moderator.type";

function formatDate(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface Props {
  data: ReportedEvent[];
}

export default function ReportedEventTable({ data }: Props) {
  const columns: ColumnDef<ReportedEvent>[] = [
    { header: "No", width: "5%", render: (_, i) => i + 1 },
    { header: "Event Name", accessorKey: "eventName", width: "10%" },
    { header: "Reason", accessorKey: "reason", width: "20%" },
    {
      header: "Reported By",
      accessorKey: "reportedBy",
      width: "20%",
      render: (item) => item.reportedBy || "User not found",
    },
    { header: "Date", width: "15%", render: (item) => formatDate(item.time) },
  ];

  return (
      <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-md p-4 flex flex-col">
        <div className="flex-1 min-h-0 overflow-auto">
          <GenericSmallTableReportEvent
              data={data.slice(0, 6)}
              columns={columns}
          />
        </div>
      </div>
  );
}