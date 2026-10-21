"use client";

import React from "react";
import GenericTable, { type ColumnDef } from "../GenericTable";
import { CloseCircle, Eye, Refresh, TickCircle } from "iconsax-react";
import { ModReportManagement } from "@/types/moderator.type";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/format";
import { contentTypeStyles, statusStyles } from "@/constant/category.config";

type reportTableProps = {
  data: ModReportManagement[];
  activeTab?: string;
  startIndex?: number;
  onApproveAction?: (item: ModReportManagement) => void;
  onRejectAction?: (item: ModReportManagement) => void;
};

export default function ReportTable({
  data = [],
  startIndex = 0,
}: reportTableProps) {
  const router = useRouter();
  const handleView = (row: ModReportManagement) => {
    const type = row.type === "Event" ? "event" : "activity";
    router.push(`/moderator/reports/${row.reportId}?type=${type}`);
  };
  const columns: ColumnDef<ModReportManagement>[] = [
    { header: "No", render: (_, i) => startIndex + i + 1, width: "5%" },
    { header: "Reason", accessorKey: "reason", width: "16%" },
    {
      header: "Type",
      accessorKey: "type",
      width: "12%",
      render: (row) => {
        const typeClass =
          contentTypeStyles[row.type] ||
          "border-gray-300 bg-gray-50 text-gray-600";
        return (
          <span
            className={`inline-flex items-center rounded-full border px-4 py-1 text-sm font-medium ${typeClass}`}
          >
            {row.type}
          </span>
        );
      },
    },
    {
      header: "Reporter",
      accessorKey: "reporter",
      width: "15%",
      render: (row) => {
        const limit = 15;
        const reporter = row.reporter ?? "";
        const truncated =
          reporter.length > limit ? `${reporter.slice(0, limit)}...` : reporter;
        return <span title={reporter}>{truncated}</span>;
      },
    },

    {
      header: "Submitted",
      width: "12%",
      render: (row) => formatDate(row.date),
    },

    {
      header: "Status",
      accessorKey: "status",
      width: "12%",
      render: (row) => {
        const statusClass =
          statusStyles[row.status] ||
          "border-gray-300 bg-gray-50 text-gray-600";
        return (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-1 text-sm font-medium ${statusClass}`}
          >
            <span className="me-2">
              {row.status === "Approved" ? (
                <TickCircle size={16} color="#00C950" />
              ) : row.status === "Pending" ? (
                <Refresh size={16} color="#FFA800" />
              ) : (
                <CloseCircle size={16} color="#FD346E" />
              )}
            </span>
            {row.status}
          </span>
        );
      },
    },
  ];

  columns.push({
    header: "Action",
    width: "8%",
    render: (item) => (
      <div className="relative flex items-center gap-2 ml-3">
        <button
          type="button"
          title="View detail"
          onClick={(e) => {
            e.stopPropagation();
            handleView(item);
          }}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <Eye size={18} color="#22c55e" />
        </button>
      </div>
    ),
  });

  return (
    <div className="h-full">
      <GenericTable data={data} columns={columns} />
    </div>
  );
}
