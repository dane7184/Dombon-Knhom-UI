"use client";

import React, { useState, useEffect } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Dropdown } from "@/components/dashboard/moderator/Dropdown";
import { PaginationTable } from "@/components/dashboard/moderator/PaginationTable";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import ReportTable from "@/components/dashboard/system-admin/ReportTable";
import { useAdminReports } from "@/hooks/admin/useAdminReports";
import { PaginatedData } from "@/types/common.type";
import { ReportResponse } from "@/types/moderator.type";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type ReportTab = "all" | "event" | "activity";
type ReportStatusFilter = "all" | "pending" | "approved" | "rejected";

const ITEMS_PER_PAGE = 11;

export default function ReportsClient({
  initialData,
}: {
  initialData: PaginatedData<ReportResponse>;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab") as ReportTab | null;
  const initialTab: ReportTab = (tabParam === "event" || tabParam === "activity") ? tabParam : "all";

  const [curTab, setCurTab] = useState<ReportTab>(initialTab);

  // Sync state if URL query param changes (e.g. on back navigation)
  useEffect(() => {
    const activeTab = searchParams.get("tab") as ReportTab | null;
    const tab: ReportTab = (activeTab === "event" || activeTab === "activity") ? activeTab : "all";
    setCurTab(tab);
  }, [searchParams]);
  const [statusFilter, setStatusFilter] = useState<ReportStatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const isDefaultView =
    curTab === "all" &&
    statusFilter === "all" &&
    sortOrder === "newest" &&
    currentPage === 1;

  const { data } = useAdminReports(
    {
      type:
        curTab === "all"
          ? undefined
          : curTab === "event"
            ? "Event"
            : "Activity",
      status:
        statusFilter === "all"
          ? undefined
          : ((statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)) as
              | "Pending"
              | "Approved"
              | "Rejected"),
      sort: sortOrder === "newest" ? "Newest" : "Oldest",
      page: currentPage,
      size: ITEMS_PER_PAGE,
    },
    isDefaultView ? initialData : undefined,
  );

  const reportData = data?.content ?? [];
  const reportPagination = data
    ? { totalElements: data.totalElements, totalPages: data.totalPages }
    : null;

  const handleTabToggle = (val: string) => {
    setCurTab(val as ReportTab);
    setCurrentPage(1);

    const params = new URLSearchParams(searchParams.toString());
    if (val === "all") {
      params.delete("tab");
    } else {
      params.set("tab", val);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const tabOptions = [
    { value: "all", label: "All" },
    { value: "event", label: "Event" },
    { value: "activity", label: "Activity" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
  ];

  return (
    <div className="bg-white h-full p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
      <Tabs
        value={curTab}
        onValueChange={handleTabToggle}
        className="w-full flex-1 min-h-0 flex flex-col"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 shrink-0">
          <DashboardTabs options={tabOptions} />

          <div className="flex gap-4 items-center w-full sm:w-auto justify-end text-sm font-medium text-(--text-desc)">
            <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-2">
              <p className="whitespace-nowrap text-md text-black">Status:</p>
              <Dropdown
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val as ReportStatusFilter);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "All" },
                  { value: "pending", label: "Pending" },
                  { value: "approved", label: "Approved" },
                  { value: "rejected", label: "Rejected" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="w-full flex-1 min-h-0 flex flex-col mt-0 mb-6">
          <ReportTable
            data={reportData}
            activeTab={statusFilter}
            pageOffset={(currentPage - 1) * ITEMS_PER_PAGE}
          />
        </div>
      </Tabs>

      <div className="pt-6 border-t border-gray-50 shrink-0">
        <PaginationTable
          totalItems={reportPagination?.totalElements ?? reportData.length}
          itemsPerPage={ITEMS_PER_PAGE}
          currentPage={currentPage}
          onPageChange={(page) => {
            if (page >= 1 && page <= (reportPagination?.totalPages ?? 1)) {
              setCurrentPage(page);
            }
          }}
        />
      </div>
    </div>
  );
}
