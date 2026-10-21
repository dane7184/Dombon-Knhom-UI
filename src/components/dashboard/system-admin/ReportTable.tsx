"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import GenericTable, {
  type ColumnDef,
} from "@/components/dashboard/GenericTable";
import { ReportResponse } from "@/types/moderator.type";
import { CloseCircle, Eye, Refresh, TickCircle } from "iconsax-react";
import { AppStatus } from "@/types/common.type";
import { formatDateString } from "@/services/event.service";
import { contentTypeStyles, statusStyles } from "@/constant/category.config";

type ReportTableProps = {
  data: ReportResponse[];
  activeTab: string;
  pageOffset: number;
};

function ReportTable({ data, pageOffset }: ReportTableProps) {
  const router = useRouter();

  const handleView = (row: ReportResponse) => {
    const type = row.type === "Event" ? "event" : "activity";
    router.push(`/system-admin/reports/${row.reportId}?type=${type}`);
  };

  const columns = useMemo<ColumnDef<ReportResponse>[]>(() => {
    return [
      {
        header: "No",
        width: "5%",
        render: (_row, index) => pageOffset + index + 1,
      },
      {
        header: "Reason",
        accessorKey: "reason",
        width: "25%",
      },
      {
        header: "Type",
        accessorKey: "type",
        width: "10%",
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
        width: "20%",
        render: (row) => {
          const limit = 25;
          const reporter = row.reporter ?? "";
          const truncated =
            reporter.length > limit
              ? `${reporter.slice(0, limit)}...`
              : reporter;
          return <span title={reporter}>{truncated}</span>;
        },
      },
      {
        header: "Submitted",
        accessorKey: "createdAt",
        width: "15%",
        render: (row) => formatDateString(row.createdAt),
      },
      {
        header: "Status",
        accessorKey: "status",
        width: "12%",
        render: (row) => {
          const statusClass =
            statusStyles[row.status as AppStatus] ||
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
      {
        header: "Action",
        width: "5%",
        render: (item) => (
          <div className="w-full h-full flex justify-center items-center">
            <button
              type="button"
              title="View detail"
              onClick={(e) => {
                e.stopPropagation();
                handleView(item);
              }}
              className="p-1 hover:bg-green-100 cursor-pointer rounded-full transition-colors ease-in-out duration-300"
            >
              <Eye size={20} color="#22c55e" />
            </button>
          </div>
        ),
      },
    ];
  }, [pageOffset]);

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <GenericTable data={data} columns={columns} />
    </div>
  );
}

export default ReportTable;
