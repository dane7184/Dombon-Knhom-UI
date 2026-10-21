"use client";

import React, { useEffect, useRef, useState } from "react";
import GenericTable, { type ColumnDef } from "../GenericTable";
import { EventSubmission } from "@/types/moderator.type";
import { CloseCircle, Eye, Refresh, TickCircle } from "iconsax-react";
import { getCategoryConfig, statusStyles } from "@/constant/category.config";
import Link from "next/link";

type eventSubmissionProps = {
  data?: EventSubmission[];
  activeTab?: string;
  startIndex?: number;
  onApproveAction: (item: EventSubmission) => void;
  onRejectAction: (item: EventSubmission) => void;
};

export default function SubmissionTable({
  data = [],
  startIndex = 0,
  onApproveAction,
  onRejectAction,
}: eventSubmissionProps) {
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

  const columns: ColumnDef<EventSubmission>[] = [
    {
      header: "No",
      width: "6%",
      render: (_item, rowIndex) => <span>{startIndex + rowIndex + 1}</span>,
    },
    {
      header: "Event Name",
      accessorKey: "eventName",
      width: "22%",
      render: (item) => {
        const limit = 25;
        const name = item.eventName ?? "";
        const truncated =
          name.length > limit ? `${name.slice(0, limit)}...` : name;
        return <span title={name}>{truncated}</span>;
      },
    },
    { header: "User", accessorKey: "user", width: "20%" },
    {
      header: "Category",
      accessorKey: "category",
      width: "14%",
      render: (item) => {
        const config = getCategoryConfig(item.category ?? "").config;
        const Icon = config.icon;
        return (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1 text-sm uppercase font-medium"
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
    { header: "Province", accessorKey: "province", width: "13%" },
    {
      header: "Submitted",
      accessorKey: "createdAt",
      width: "13%",
      render: (item) => <span>{(item.createdAt ?? "").slice(0, 10)}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      width: "12%",
      render: (item) => {
        const statusClass =
          statusStyles[item.status as keyof typeof statusStyles] ||
          "border-gray-300 bg-gray-50 text-gray-600";
        return (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-1 text-sm font-medium ${statusClass}`}
          >
            <span className="me-2">
              {item.status === "Approved" ? (
                <TickCircle size={16} color="#00C950" />
              ) : item.status === "Pending" ? (
                <Refresh size={16} color="#FFA800" />
              ) : (
                <CloseCircle size={16} color="#FD346E" />
              )}
            </span>
            {item.status}
          </span>
        );
      },
    },
    {
      header: "Action",
      width: "7%",
      render: (item) => {
        const stringId = String(item.eventId);
        const isMenuOpen = activeDropdownId === stringId;
        const isPending = item.status === "Pending";

        return (
          <div
            className="relative flex items-center gap-2"
            ref={isMenuOpen ? dropdownRef : null}
          >
            {/* view  */}
            <Link href={`/moderator/event-submissions/${item.eventId}`}>
              <button
                type="button"
                className="p-1 hover:bg-green-100 cursor-pointer rounded-full transition-colors ease-in-out duration-300"
              >
                <Eye size={20} color="#22c55e" />
              </button>
            </Link>

            {/* ── Dropdown ── */}
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
    },
  ];

  return <GenericTable data={data} columns={columns} />;
}
