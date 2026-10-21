"use client";

import GenericSmallTableOrganizationRequest, {
  type ColumnDef,
} from "../GenericSmallTableOrganizationRequest";
import { OrganizationRequest } from "@/types/moderator.type";
import { TickCircle, CloseCircle, Refresh } from "iconsax-react";
import { statusStyles } from "@/constant/category.config";

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
  data: OrganizationRequest[];
}

export default function OrganizationRequestTable({ data }: Props) {
  const columns: ColumnDef<OrganizationRequest>[] = [
    { header: "No", width: "5%", render: (_, i) => i + 1 },
    { header: "Organization Name", accessorKey: "eventName", width: "38%" },
    {
      header: "User",
      accessorKey: "organizerName",
      width: "27%",
      render: (item) => item.organizerName || "User not found",
    },
    {
      header: "Status",
      accessorKey: "status",
      width: "15%",
      render: (row) => {
        const statusClass =
          statusStyles[row.status as keyof typeof statusStyles] ||
          "border-gray-300 bg-gray-50 text-gray-600";

        return (
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusClass}`}
          >
            <span className="me-1.5">
              {row.status === "Approved" ? (
                <TickCircle size={18} color="#00C950" />
              ) : row.status === "Pending" ? (
                <Refresh size={18} color="#FFA800" />
              ) : (
                <CloseCircle size={18} color="#FD346E" />
              )}
            </span>
            {row.status}
          </span>
        );
      },
    },
    {
      header: "Date",
      width: "10%",
      render: (item) => formatDate(item.time),
    },
  ];

  return (
    <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-md p-4 flex flex-col">
      <div className="flex-1 min-h-0 overflow-auto">
        <GenericSmallTableOrganizationRequest data={data} columns={columns} />
      </div>
    </div>
  );
}
