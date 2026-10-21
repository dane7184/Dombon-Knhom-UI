"use client";

import React, { useState, useEffect, useRef } from "react";
import GenericTable, {
  type ColumnDef,
} from "@/components/dashboard/GenericTable";
import { Eye, TickCircle, CloseCircle, Refresh } from "iconsax-react";
import { ModOrganizerRequest } from "@/types/moderator.type";
import Link from "next/link";
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

type orgRequestProps = {
  data?: ModOrganizerRequest[];
  activeTab?: string;
  startIndex?: number;
  onApproveAction: (item: ModOrganizerRequest) => void;
  onRejectAction: (item: ModOrganizerRequest) => void;
};

export default function OrgRequestTable({
  data = [],
  startIndex = 0,
  onApproveAction,
  onRejectAction,
}: orgRequestProps) {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const columns: ColumnDef<ModOrganizerRequest>[] = [
    { header: "No", width: "5%", render: (_, i) => startIndex + i + 1 },
    {
      header: "Org Name",
      accessorKey: "orgName",
      width: "18%",
      render: (item) => {
        const limit = 16;
        const name = item.orgName ?? "";
        const truncated =
          name.length > limit ? `${name.slice(0, limit)}...` : name;
        return <span title={name}>{truncated}</span>;
      },
    },
    { header: "Phone", accessorKey: "phone", width: "15%",render: (item) => item.phone || "none" },
    { header: "Request By", accessorKey: "requestBy", width: "15%", render: (item) => item.requestBy || "User not found" },
    {
      header: "Submitted",
      width: "15%",
      render: (item) => formatDate(item.submitted),
    },
    {
      header: "Status",
      accessorKey: "status",
      width: "10%",
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
    width: "10%",
    render: (item) => {
      const stringId = String(item.orgId);
      const isMenuOpen = activeDropdownId === stringId;
      const isPending = item.status === "Pending";

      return (
        <div
          className="relative flex items-center gap-2 ml-3"
          ref={isMenuOpen ? dropdownRef : null}
        >
          {/* view */}
          <Link href={`/moderator/organization-requests/${item.orgId}`}>
            <button
              type="button"
              className="cursor-pointer p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Eye size={18} color="#22c55e" />
            </button>
          </Link>

          {/* ── Dropdown: approve/reject moved to the request detail page ── */}
          {isMenuOpen && isPending && (
            <div
              className="absolute right-0 top-8 z-50 w-28 bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  onApproveAction(item);
                  setActiveDropdownId(null);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer block"
              >
                Approve
              </button>
              <div className="w-full h-px bg-gray-100" />
              <button
                type="button"
                onClick={() => {
                  onRejectAction(item);
                  setActiveDropdownId(null);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer block"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      );
    },
  });

  return <GenericTable data={data} columns={columns} />;
}
