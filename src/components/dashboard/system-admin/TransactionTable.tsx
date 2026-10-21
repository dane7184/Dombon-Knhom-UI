"use client";

import React, { useMemo } from "react";
import GenericTable, { type ColumnDef } from "../GenericTable";
import { TransactionResponse } from "@/types/admin.type";
import { Eye } from "iconsax-react";

type Props = {
  data: TransactionResponse[];
  pageOffset: number;
  onView?: (row: TransactionResponse, index: number) => void;
};

export default function TransactionTable({ data, pageOffset, onView }: Props) {
  const columns = useMemo<ColumnDef<TransactionResponse>[]>(
    () => [
      {
        header: "No",
        width: "5%",
        render: (_item, index) => pageOffset + index + 1,
      },
      {
        header: "User",
        accessorKey: "fullName",
        width: "20%",
        render: (row) => {
          const limit = 20;
          const name = row.fullName ?? "";
          const truncated =
            name.length > limit ? `${name.slice(0, limit)}...` : name;
          return <span title={name}>{truncated}</span>;
        },
      },
      {
        header: "Amount",
        accessorKey: "amount",
        width: "10%",
        render: (item) => {
          const value = item.amount as number | string;
          if (typeof value === "number") {
            return `$${value.toLocaleString("en-US")}`;
          }
          return String(value);
        },
      },
      {
        header: "Organizer",
        accessorKey: "organizer",
        width: "20%",
        render: (row) => {
          const limit = 20;
          const name = row.organizer ?? "";
          const truncated =
            name.length > limit ? `${name.slice(0, limit)}...` : name;
          return <span title={name}>{truncated}</span>;
        },
      },
      {
        header: "Event",
        accessorKey: "event",
        width: "20%",
        render: (row) => {
          const limit = 20;
          const name = row.event ?? "";
          const truncated =
            name.length > limit ? `${name.slice(0, limit)}...` : name;
          return <span title={name}>{truncated}</span>;
        },
      },
      {
        header: "Date",
        accessorKey: "date",
        width: "15%",
        render: (item) => (item.date ? item.date.slice(0, 10) : "—"),
      },
      {
        header: "Action",
        width: "6%",
        render: (row, index) => (
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => onView?.(row, pageOffset + index + 1)}
              className="p-1 hover:bg-green-100 cursor-pointer rounded-full transition-colors ease-in-out duration-300"
            >
              <Eye size={20} color="#22c55e" />
            </button>
          </div>
        ),
      },
    ],
    [pageOffset, onView],
  );
  return <GenericTable data={data} columns={columns} />;
}
