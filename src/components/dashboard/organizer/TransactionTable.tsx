"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { CloseCircle, Eye, Refresh } from "iconsax-react";
import { CheckCircle, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dropdown } from "@/components/dashboard/moderator/Dropdown";
import { PaginationTable } from "@/components/dashboard/moderator/PaginationTable";
import {RecentTransaction} from "@/types/organizer.type";
import {resolveMediaUrl} from "@/lib/media";

interface Props {
  data: RecentTransaction[];
  error?: string | null;
}

export default function TransactionTable({ data, error }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [previewProof, setPreviewProof] = useState<string | null>(null);
  const itemsPerPage = 3;
  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getStatus = (type: string, status: RecentTransaction["status"]) => {
    if (type === "Withdraw") {
      if (status === "Rejected") return "Failed";
      if (status === "Pending") return "Pending";
      return "Succeed";
    }
    return "Succeed";
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();

      return sortBy === "newest"
          ? timeB - timeA
          : timeA - timeB;
    });
  }, [data, sortBy]);

  // 2. Pagination Calculation
  const paginatedData = useMemo(() => {
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    return sortedData.slice(firstIndex, lastIndex);
  }, [sortedData, currentPage]);

  return (
    <div className="bg-white rounded-2xl box-shadow w-full overflow-hidden border border-[#eaecf0] mt-4">
      <div className="p-5 flex flex-row justify-between items-center gap-3">
        <h2 className="text-lg sm:text-xl font-bold secondary-color truncate">
          Recent Transaction
        </h2>

        {/* Using your custom Dropdown component */}
        <div className="flex gap-3 items-center text-sm font-medium text-(--text-desc) shrink-0">
          <p className="whitespace-nowrap text-desc text-md">Sort by:</p>
          <Dropdown
            value={sortBy}
            onChange={(val) => {
              setSortBy(val as "newest" | "oldest");
              setCurrentPage(1); // Reset page when sorting changes
            }}
          />
        </div>
      </div>

      <div className="overflow-x-auto ml-6 mr-5 border border-[#eaecf0] rounded-lg mb-6">
        <Table className="">
          <TableHeader className="bg-[#f4f7f9]">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-4 px-6 text-base font-semibold secondary-color">
                Transaction ID
              </TableHead>
              <TableHead className="py-4 px-6 text-base font-semibold secondary-color">
                Date
              </TableHead>
              <TableHead className="py-4 px-6 text-base font-semibold secondary-color">
                Description
              </TableHead>
              <TableHead className="py-4 px-6 text-base font-semibold secondary-color">
                Amount
              </TableHead>
              <TableHead className="py-4 px-6 text-base font-semibold secondary-color">
                Status
              </TableHead>
              <TableHead className="py-4 px-6 text-base font-semibold secondary-color text-center">
                Proof
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            { error ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 px-6 text-center text-sm text-[#e11d48]">
                  {error}
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 px-6 text-center text-sm text-desc">
                  No recent transactions found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((tx, index) => {
                  const status = getStatus(tx.type, tx.status);

                return (
                  <TableRow
                    key={tx.id || index}
                    className="border-b border-[#eaecf0] hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="py-5 px-6 text-[13px] text-des font-medium" title={tx.id}>
                      {tx.id?.slice(0, 8)}
                    </TableCell>
                    <TableCell className="py-5 px-6 text-[13px] text-des">
                      {formatDate(tx.createdAt)}
                    </TableCell>
                    <TableCell className="py-5 px-6 text-[13px] text-des">
                      {tx.note || tx.type}
                    </TableCell>
                    <TableCell
                      className={`py-5 px-6 text-[13px] font-semibold ${tx.amount < 0 ? "text-[#e11d48]" : "text-[#22c55e]"}`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      {status === "Failed" ? (
                        <div className="inline-flex items-center gap-1.5 bg-[#fff1f2] border border-[#fecdd3] text-[#e11d48] px-3 py-1 rounded-full text-[11px] font-medium">
                          <CloseCircle size={14} color="#e11d48" /> Failed
                        </div>
                      ) : status === "Pending" ? (
                        <div className="inline-flex items-center gap-1.5 bg-[#fffbeb] border border-[#fde68a] text-[#d97706] px-3 py-1 rounded-full text-[11px] font-medium">
                          <Refresh size={14} color="#d97706" /> Pending
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] px-3 py-1 rounded-full text-[11px] font-medium">
                          <CheckCircle size={14} color="#16a34a" /> Succeed
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-5 px-6 text-center">
                      {tx.type === "Withdraw" && tx.proofUrl ? (
                        <button
                          type="button"
                          title="View payment proof"
                          onClick={() => setPreviewProof(tx.proofUrl)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer inline-flex items-center justify-center"
                        >
                          <Eye size={18} color="#22c55e" />
                        </button>
                      ) : (
                        <span className="text-[13px] text-[#94a3b8]">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      {!error && sortedData.length > 0 && (
        <div className="pb-6 px-6">
          <PaginationTable
            totalItems={sortedData.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {previewProof && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setPreviewProof(null)}
        >
          <div
            className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl relative"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setPreviewProof(null)}
              className="absolute right-4 top-4 w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold secondary-color mb-4">
              Withdrawal Proof
            </h3>
            <div className="relative w-full h-80 rounded-xl overflow-hidden bg-gray-50">
              <Image
                src={resolveMediaUrl(previewProof)}
                alt="Withdrawal proof"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
