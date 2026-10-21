"use client";

import React, {useMemo, useState} from "react";
import GenericTable, {type ColumnDef,} from "@/components/dashboard/GenericTable";
import {PaginationTable} from "@/components/dashboard/moderator/PaginationTable";
import {RecentUser as RecentUserDataType} from "@/types/admin.type";
import {RoleStyle} from "@/constant/category.config";

interface RecentUserProps {
  recnentUser: RecentUserDataType[];
}

export default function RecentUser({ recnentUser }: RecentUserProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return recnentUser.slice(start, start + itemsPerPage);
  }, [currentPage, recnentUser]);
  const columns: ColumnDef<RecentUserDataType>[] = [
    {
      header: "No",
      width: "8%",
      render: (_, index) => <>{(currentPage - 1) * itemsPerPage + index + 1}</>
    },
    {
      header: "Full Name",
      accessorKey: "fullName",
      width: "25%",
      render: (row) => {
        const limit = 15;
        const name = row.fullName ?? "";
        const truncated =
          name.length > limit ? `${name.slice(0, limit)}...` : name;
        return <span title={name}>{truncated}</span>;
      },
    },
    { header: "Gender", accessorKey: "gender", width: "12%" },
    {
      header: "Gmail",
      accessorKey: "email",
      width: "30%",
      render: (row) => {
        const limit = 25;
        const email = row.email ?? "";
        const truncated =
          email.length > limit ? `${email.slice(0, limit)}...` : email;
        return <span title={email}>{truncated}</span>;
      },
    },
    {
      header: "Role",
      accessorKey: "role",
      width: "10%",
      render: (row) => {
        const roleClass =
            RoleStyle[row.role] || "border-gray-300 bg-gray-50 text-gray-600";
        return (
            <span
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-medium ${roleClass}`}
            >
            {row.role}
          </span>
        );
      },
    },
  ];

  return (
      <div className="bg-white p-6 rounded-2xl box-shadow flex flex-col h-full">
        <h2 className="text-lg font-bold secondary-color mb-4 shrink-0">
          Recent User
        </h2>

        <div className="flex flex-col h-full min-h-0 justify-between">
          <GenericTable data={paginatedData} columns={columns} />

          <div className="pt-6 shrink-0">
            <PaginationTable
                totalItems={recnentUser.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </div>
  );
}