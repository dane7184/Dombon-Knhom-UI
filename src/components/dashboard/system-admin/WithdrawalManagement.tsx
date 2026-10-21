"use client";
import React, { useMemo, useState } from "react";
import { Dropdown } from "@/components/dashboard/moderator/Dropdown";
import { PaginationTable } from "@/components/dashboard/moderator/PaginationTable";
import DashboardTabs from "../DashboardTabs";
import WithdrawalTable from "./WithdrawalTable";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/modals/Toast";
import { useAdminWithdrawals } from "@/hooks/admin/useAdminWithdrawals";

type TabTypes = "all" | "approved" | "rejected";

export default function WithdrawalManagement() {
  const [curTab, setCurTab] = useState<TabTypes>("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const { toastData, showToast, hideToast } = useToast();

  const itemsPerPage = 8;

  const status =
    curTab === "approved" ? "Approved" : curTab === "rejected" ? "Rejected" : undefined;
  const { data: withdrawalData = [] } = useAdminWithdrawals(status);

  // Filter by tab
  const processedData = useMemo(() => {
    const result =
      curTab === "all"
        ? withdrawalData
        : withdrawalData.filter((item) => item.status.toLowerCase() === curTab);

    return [...result].sort((a, b) => {
      const dateA = new Date(a.requestDate).getTime();
      const dateB = new Date(b.requestDate).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [curTab, sortOrder, withdrawalData]);

  const totalPages = Math.max(
    1,
    Math.ceil(processedData.length / itemsPerPage),
  );

  // Slice data for current page
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage]);

  const tabOptions = [
    { value: "all", label: "All" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
  ];

  return (
    <div className="bg-white h-full p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
      {/* Toast — floats at top-right of screen */}
      {toastData && (
        <Toast
          type={toastData.type}
          title={toastData.title}
          message={toastData.message}
          onCloseAction={hideToast}
        />
      )}
      
      <Tabs
        value={curTab}
        onValueChange={(val) => {
          setCurTab(val as TabTypes);
          setCurrentPage(1);
        }}
        className="w-full flex-1 min-h-0 flex flex-col"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 shrink-0">
          <DashboardTabs options={tabOptions} />
          <div className="flex gap-3 items-center w-full sm:w-auto justify-end text-sm font-medium text-(--text-desc)">
            <p className="whitespace-nowrap text-md text-black">Sort by:</p>
            <Dropdown
              value={sortOrder}
              onChange={(val) => {
                setSortOrder(val);
                setCurrentPage(1);
              }}
              options={sortOptions}
            />
          </div>
        </div>

        <TabsContent
          value="all"
          className="w-full flex-1 min-h-0 flex flex-col mt-0 mb-6 data-[state=inactive]:hidden"
        >
          <WithdrawalTable
            data={paginatedData}
            currentTab="all"
            onSuccessAction={(msg) => showToast({ type: "success", title: "Success!", message: msg })}
            onErrorAction={(msg)   => showToast({ type: "error",   title: "Failed!",  message: msg })}
          />
        </TabsContent>
        <TabsContent
          value="approved"
          className="w-full flex-1 min-h-0 flex flex-col mt-0 mb-6 data-[state=inactive]:hidden"
        >
          <WithdrawalTable
            data={paginatedData}
            currentTab="approved"
            onSuccessAction={(msg) => showToast({ type: "success", title: "Success!",        message: msg })}
            onErrorAction={(msg)   => showToast({ type: "error",   title: "Failed!",         message: msg })}
          />
        </TabsContent>
        <TabsContent
          value="rejected"
          className="w-full flex-1 min-h-0 flex flex-col mt-0 mb-6 data-[state=inactive]:hidden"
        >
          <WithdrawalTable
            data={paginatedData}
            currentTab="rejected"
            onSuccessAction={(msg) => showToast({ type: "success", title: "Success!", message: msg })}
            onErrorAction={(msg)   => showToast({ type: "error",   title: "Failed!",  message: msg })}
          />
        </TabsContent>
      </Tabs>

      <div className="pt-6 border-t border-gray-50 shrink-0">
        <PaginationTable
          totalItems={processedData.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={(page) => {
            if (page >= 1 && page <= totalPages) setCurrentPage(page);
          }}
        />
      </div>
    </div>
  );
}