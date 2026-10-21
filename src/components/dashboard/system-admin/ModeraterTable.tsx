import React, { useMemo } from "react";
import GenericTable, { type ColumnDef } from "../GenericTable";
import { Eye, Edit, Trash } from "iconsax-react";
import { AdminModerator } from "@/types/admin.type";

type Props = {
  data: AdminModerator[];
  pageOffset?: number;
  onView: (row: AdminModerator) => void; 
  onEdit: (row: AdminModerator) => void; 
  onDelete: (row: AdminModerator) => void; 
};

export default function ModeratorTable({
  data,
  pageOffset = 0,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const columns = useMemo<ColumnDef<AdminModerator>[]>(
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
        header: "Province",
        accessorKey: "province",
        width: "20%",
        render: (row) => {
          const limit = 20;
          const province = row.province ?? "";
          const truncated =
            province.length > limit ? `${province.slice(0, limit)}...` : province;
          return <span title={province}>{truncated}</span>;
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
              <Edit size={20} color="var(--main-color)" />
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
    [onView, onEdit, onDelete, pageOffset],
  );

  return <GenericTable data={data} columns={columns} />;
}