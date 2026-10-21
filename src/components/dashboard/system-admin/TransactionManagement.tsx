"use client";
import { Dropdown } from "@/components/dashboard/moderator/Dropdown";
import { PaginationTable } from "@/components/dashboard/moderator/PaginationTable";
import TransactionTable from "./TransactionTable";
import { useState } from "react";

import { useAdminTransactions } from "@/hooks/admin/useAdminWithdrawals";
import { useDebounce } from "@/hooks/useDebounce";
import { TransactionResponse } from "@/types/admin.type";
import PaymentDetailPopUp, {
  PaymentDetail,
} from "@/components/modals/PaymentDetailPopUp";

const ITEMS_PER_PAGE = 11;

export default function TransactionManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(
    null,
  );

  const { data } = useAdminTransactions({
    search: debouncedSearchQuery || undefined,
    sort: sortOrder === "newest" ? "Newest" : "Oldest",
    page: currentPage,
    size: ITEMS_PER_PAGE,
  });

  const transactions = data?.content ?? [];
  const pagination = data;

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
  ];

  const handleViewTransaction = (row: TransactionResponse, no: number) => {
    setSelectedPayment({
      no,
      user: row.fullName ?? "",
      amount:
        typeof row.amount === "number"
          ? `$${row.amount.toLocaleString("en-US")}`
          : String(row.amount),
      organizer: row.organizer ?? "",
      event: row.event ?? "",
      date: row.date ? row.date.slice(0, 10) : "—",
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white p-6 rounded-2xl flex flex-col h-full border border-gray-100 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 shrink-0">
        <div className="relative w-md">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-(--secondary-color) outline-none placeholder:text-slate-400 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/20 transition-all"
          />
        </div>

        <div className="flex gap-3 items-center w-full sm:w-auto justify-end text-sm font-medium text-(--text-desc)">
          <p className="whitespace-nowrap text-md text-black">Sort by:</p>
          <Dropdown
            value={sortOrder}
            onChange={(val) => {
              setSortOrder(val as "newest" | "oldest");
              setCurrentPage(1);
            }}
            options={sortOptions}
          />
        </div>
      </div>

      <div className="w-full flex-1 min-h-0 flex flex-col mt-0 mb-6">
        <TransactionTable
          data={transactions}
          pageOffset={(currentPage - 1) * ITEMS_PER_PAGE}
          onView={handleViewTransaction}
        />
      </div>

      <div className="pt-6 border-t border-gray-50 shrink-0">
        <PaginationTable
          totalItems={pagination?.totalElements ?? transactions.length}
          itemsPerPage={ITEMS_PER_PAGE}
          currentPage={currentPage}
          onPageChange={(page) => {
            if (page >= 1 && page <= (pagination?.totalPages ?? 1)) {
              setCurrentPage(page);
            }
          }}
        />
      </div>

      <PaymentDetailPopUp
        isOpen={isModalOpen}
        isClose={() => setIsModalOpen(false)}
        detail={selectedPayment}
      />
    </div>
  );
}
