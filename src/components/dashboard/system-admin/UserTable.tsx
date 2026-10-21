import React, { useMemo } from "react";
import GenericTable, { type ColumnDef } from "../GenericTable";
import { Eye, Edit, Trash, TickCircle, CloseCircle } from "iconsax-react";
import { AdminUser } from "@/types/admin.type";

type Props = {
  data: AdminUser[];
  pageOffset?: number;
  onView: (row: AdminUser) => void;
  onEdit: (row: AdminUser) => void; 
  onDelete: (row: AdminUser) => void;
};

export default function UserTable({ data, pageOffset = 0, onView, onEdit, onDelete }: Props) {
  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        header: "No",
        width: "5%",
        render: (_item, rowIndex) => rowIndex + 1 + pageOffset,
      },
      {
        header: "Full Name",
        accessorKey: "fullName",
        width: "20%",
        render: (row) => {
          const limit = 15;
          const name = row.fullName ?? "";
          const truncated =
            name.length > limit ? `${name.slice(0, limit)}...` : name;
          return <span title={name}>{truncated}</span>;
        },
      },
      { header: "Gender", accessorKey: "gender", width: "10%" },
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
        header: "Organization",
        accessorKey: "organization",
        width: "20%",
        render: (row) => {
          const limit = 20;
          const org = row.organization ?? "";
          if (!org) return "none";
          const truncated =
            org.length > limit ? `${org.slice(0, limit)}...` : org;
          return <span title={org}>{truncated}</span>;
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        width: "15%",
        render: (row) => {
          const isActive = row.status === "Active";
          return (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-1 text-sm font-medium
            ${ isActive
                ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                : "border-red-300 bg-red-50 text-red-600"
            }`}
            >
              <span className="me-2">
                {isActive ? (
                  <TickCircle size={16} color="#00C950" />
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
              onClick={() => onEdit(row)}
              className="p-1 hover:bg-(--main-color)/10 cursor-pointer rounded-full transition-colors ease-in-out duration-300"
            >
              <Edit size={20} color="#38bdf8" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(row)}
              className="p-1 hover:bg-(--accent-color)/10 cursor-pointer rounded-full transition-colors ease-in-out duration-300"
            >
              <Trash size={20} color="#fb7185" />
            </button>
          </div>
        ),
      },
    ],
    [onView, onEdit, onDelete, pageOffset],
  );

  return <GenericTable data={data} columns={columns} />;
}