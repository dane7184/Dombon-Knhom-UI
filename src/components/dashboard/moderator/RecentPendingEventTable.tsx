"use client";

import GenericSmallTable, {
  type ColumnDef,
} from "@/components/dashboard/GenericSmallTable";
import { RecentPendingEvent } from "@/types/moderator.type";
import {getCategoryConfig} from "@/constant/category.config";

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
  data: RecentPendingEvent[];
}

export default function RecentPendingEventTable({ data }: Props) {
  const columns: ColumnDef<RecentPendingEvent>[] = [
    { header: "No", width: "5%", render: (_, i) => i + 1 },
    { header: "Event Name", accessorKey: "eventName", width: "35%" },
    { header: "Organizer", accessorKey: "organizerName", width: "28%" },
    {
      header: "Category",
      accessorKey: "category",
      width: "25%",
      render: (item) => {

        const { config } = getCategoryConfig(item.category ?? "");
        const Icon = config.icon;

        return (
            <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
                style={{
                  backgroundColor: config.bg,
                  color: config.color,
                  borderColor: config.color + "40",
                }}
            >
            <Icon size={14} />
              {item.category}
          </span>
        );
      },
    },
    // {
    //   header: "Status",
    //   accessorKey: "status",
    //   width: "20%",
    //   render: (row) => {
    //     const statusClass =
    //         statusStyles[row.status] ||
    //         "border-gray-300 bg-gray-50 text-gray-600";
    //     return (
    //         <span
    //             className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusClass}`}
    //         >
    //         <span className="me-1.5">
    //           {row.status === "Approved" ? (
    //               <TickCircle size={20} color="#00C950" />
    //           ) : row.status === "Pending" ? (
    //               <Refresh size={18} color="#FFA800" />
    //           ) : (
    //               <CloseCircle size={20} color="#FD346E" />
    //           )}
    //         </span>
    //           {row.status}
    //       </span>
    //     );
    //   },
    // },
    {
      header: "Date",
      width: "15%",
      render: (item) => formatDate(item.time),
    },
  ];

  return (
      <div className="h-full">
        <GenericSmallTable
            data={data.slice(0, 3)}
            columns={columns}
        />
      </div>
  );
}
