"use client";
import { useMemo, useState } from "react";
import GenericTable, { type ColumnDef } from "../GenericTable";
import { WithdrawalResponse } from "@/types/admin.type";
import { TickCircle, CloseCircle, Refresh, Eye } from "iconsax-react";
import WithdrawalModal from "./WithdrawalModal";
import { AppStatus } from "@/types/common.type";
import {statusStyles} from "@/constant/category.config";

type WithdrawalTableProps = {
  data: WithdrawalResponse[];
  currentTab: "all" | "approved" | "rejected";
  onSuccessAction?: (message: string) => void;
  onErrorAction?: (message: string) => void;
};

export default function WithdrawalTable({
  data,
  currentTab,
  onSuccessAction,
  onErrorAction,
}: WithdrawalTableProps) {
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalResponse | null>(null);

  const columns = useMemo<ColumnDef<WithdrawalResponse>[]>(() => {
    const baseColumns: ColumnDef<WithdrawalResponse>[] = [
      {
        header: "No",
        accessorKey: "withdrawalId",
        width: "5%",
        render: (row, index) => index + 1,
      },
      {
        header: "Org Name",
        accessorKey: "orgName",
        width: "30%",
        render: (row) => {
          const limit = 25;
          const name = row.orgName ?? "Organizer not found";
          const truncated =
            name.length > limit ? `${name.slice(0, limit)}...` : name;
          return <span title={name}>{truncated}</span>;
        },
      },
      {
        header: "Amount",
        accessorKey: "amount",
        width: "20%",
        render: (item) => {
          const value = item.amount as number | string;
          if (typeof value === "number") {
            return `$${value.toLocaleString("en-US")}`;
          }
        },
      },
      {
        header: "Request Date",
        accessorKey: "requestDate",
        width: "20%",
        render: (item) =>
          item.requestDate ? item.requestDate.slice(0, 10) : "—",
      },
      {
        header: "Status",
        accessorKey: "status",
        width: "15%",
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
    ];

    // Action column — only shown on the "all" tab
    if (currentTab === "all") {
      baseColumns.push({
        header: "Action",
        width: "7%",
        render: (row) => {
          // Only show the action button for Pending rows
          if (row.status !== "Pending") return null;

          return (
            <div className="relative flex items-center justify-center mx-auto w-fit">
              <button
                onClick={() => setSelectedWithdrawal(row)}
                className="p-1 hover:bg-green-100 cursor-pointer rounded-full transition-colors ease-in-out duration-300"
              >
                <Eye size={20} color="#22c55e"/>
              </button>
            </div>
          );
        },
      });
    }

    return baseColumns;
  }, [currentTab]);

  return (
    <>
      <GenericTable data={data} columns={columns} />
      <WithdrawalModal
        withdrawal={selectedWithdrawal}
        onClose={() => setSelectedWithdrawal(null)}
        onSuccess={onSuccessAction}
        onError={onErrorAction}
      />
    </>
  );
}