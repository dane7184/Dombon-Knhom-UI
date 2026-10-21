import React, { useMemo } from "react";
import GenericTable, { type ColumnDef } from "../GenericTable";
import {
  Eye,
  Trash,
  TickCircle,
  CloseCircle,
  Refresh,
} from "iconsax-react";
import { AdminOrganizer } from "@/types/admin.type";

type Props = {
  data: AdminOrganizer[];
  pageOffset?: number;
  onView: (row: AdminOrganizer) => void;
  onDelete: (row: AdminOrganizer) => void;
};

export default function OrganizerTable({
  data,
  pageOffset = 0,
  onView,
  onDelete,
}: Props) {
  const columns = useMemo<ColumnDef<AdminOrganizer>[]>(
    () => [
      {
        header: "No",
        width: "5%",
        render: (_item, rowIndex) => rowIndex + 1 + pageOffset,
      },
      {
        header: "Org Name",
        accessorKey: "orgName",
        width: "25%",
        render: (row) => {
          const limit = 20;
          const name = row.orgName ?? "";
          const truncated =
            name.length > limit ? `${name.slice(0, limit)}...` : name;
          return <span title={name}>{truncated}</span>;
        },
      },
      {
        header: "Owner",
        accessorKey: "owner",
        width: "20%",
        render: (row) => {
          const limit = 15;
          const name = row.owner ?? "";
          const truncated =
            name.length > limit ? `${name.slice(0, limit)}...` : name;
          return <span title={name}>{truncated}</span>;
        },
      },
      {
        header: "Email",
        accessorKey: "email",
        width: "20%",
        render: (row) => {
          const limit = 25;
          const email = row.email ?? "";
          const truncated =
            email.length > limit ? `${email.slice(0, limit)}...` : email;
          return <span title={email}>{truncated}</span>;
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        width: "20%",
        render: (row) => {
          const styles: Record<string, string> = {
            Approved: "border-emerald-300 bg-emerald-50 text-emerald-600",
            Pending: "border-yellow-300 bg-yellow-50 text-yellow-600",
            Rejected: "border-red-300 bg-red-50 text-red-600",
          };
          const icon = row.status === "Approved" ? (
              <TickCircle size={16} color="#00C950" />
            ) : row.status === "Pending" ? (
              <Refresh size={16} color="#FFA800" />
            ) : (
            <CloseCircle size={16} color="#FD346E" />
          );
          return (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-1 text-sm font-medium ${styles[row.status] ?? "border-gray-300 bg-gray-50 text-gray-600"}`}
            >
              <span className="me-2">{icon}</span>
              {row.status}
            </span>
          );
        },
      },
      {
        header: "Action",
        width: "10%",
        render: (row) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onView(row)}
              className="p-1 hover:bg-green-100 cursor-pointer rounded-full transition-colors ease-in-out duration-300"
            >
              <Eye size={20} color="#22c55e" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(row)}
              className="p-1 hover:bg-(--accent-color)/10 cursor-pointer rounded-full transition-colors ease-in-out duration-300"
            >
              <Trash size={20} color="var(--accent-color)" />
            </button>
          </div>
        ),
      },
    ],
    [onView, onDelete, pageOffset],
  );

  return <GenericTable data={data} columns={columns} />;
}