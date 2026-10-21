"use client";

import { Tabs } from "@/components/ui/tabs";
import { Dropdown } from "@/components/dashboard/moderator/Dropdown";
import { PaginationTable } from "@/components/dashboard/moderator/PaginationTable";
import OrgRequestTable from "@/components/dashboard/moderator/OrgRequestTable";
import DashboardTabs from "../DashboardTabs";
import { useMemo, useState } from "react";
import { ModOrganizerRequest } from "@/types/moderator.type";

interface Props {
  organizerRequest: ModOrganizerRequest[];
}

export default function OrganizationRequest({ organizerRequest }: Props) {
  const [orgData, setOrgData] = useState<ModOrganizerRequest[]>(organizerRequest);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [interactedItemIds, setInteractedItemIds] = useState<string[]>([]);

  const itemsPerPage = 11;

  const handleApproveAction = async (item: ModOrganizerRequest) => {
    const stringId = String(item.orgId);
    setInteractedItemIds((prev) => [...prev, stringId]);

    setOrgData((prevData) =>
        prevData.map((org) =>
            String(org.orgId) === stringId ? { ...org, status: "Approved" } : org
        )
    );
  };

  const handleRejectAction = async (item: ModOrganizerRequest) => {
    const stringId = String(item.orgId);

    setInteractedItemIds((prev) => [...prev, stringId]);
    setOrgData((prevData) =>
        prevData.map((org) =>
            String(org.orgId) === stringId ? { ...org, status: "Rejected" } : org
        )
    );
  };

  // ---------------- SORTED DATA ----------------
  const sortedData = useMemo(() => {
    return [...orgData].sort((a, b) => {
      const timeA = a.submitted ? new Date(a.submitted).getTime() : 0;
      const timeB = b.submitted ? new Date(b.submitted).getTime() : 0;
      return sortBy === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [sortBy, orgData]);

  // ---------------- DYNAMIC TAB FILTER POOLS ----------------
  const currentTabPool = useMemo(() => {
    if (activeTab === "all") {
      return sortedData.filter(
          (item) =>
              item.status === "Pending" ||
              interactedItemIds.includes(String(item.orgId))
      );
    }
    if (activeTab === "approved") {
      return sortedData.filter((item) => item.status === "Approved");
    }
    if (activeTab === "reject") {
      return sortedData.filter((item) => item.status === "Rejected");
    }
    return sortedData;
  }, [activeTab, sortedData, interactedItemIds]);

  // ---------------- PAGINATION LIFECYCLE ----------------
  const totalPages = Math.ceil(currentTabPool.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const activePaginatedDataChunk = currentTabPool.slice(indexOfFirstItem, indexOfLastItem);

  const handleTabToggle = (val: string) => {
    setActiveTab(val);
    setCurrentPage(1);
  };

  const tabOptions = [
    { value: "all", label: "All" },
    { value: "approved", label: "Approved" },
    { value: "reject", label: "Rejected" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
  ];

  return (
      <div className="bg-white h-full p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
        <Tabs
            value={activeTab}
            onValueChange={handleTabToggle}
            className="w-full flex-1 min-h-0 flex flex-col"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <DashboardTabs options={tabOptions} />

            <div className="flex gap-3 items-center w-full sm:w-auto justify-end text-sm font-medium text-(--text-desc)">
              <p className="whitespace-nowrap text-md text-black">Sort by:</p>
              <Dropdown
                  value={sortBy}
                  onChange={(val) => {
                    setSortBy(val as "newest" | "oldest");
                    setCurrentPage(1);
                  }}
                  options={sortOptions}
              />
            </div>
          </div>
          <div className="w-full flex-1 min-h-0 flex flex-col mt-0 mb-6">
            <OrgRequestTable
                data={activePaginatedDataChunk}
                activeTab={activeTab}
                startIndex={indexOfFirstItem}
                onApproveAction={handleApproveAction}
                onRejectAction={handleRejectAction}
            />
          </div>
        </Tabs>
        <div className="pt-6 border-t border-gray-50 shrink-0">
          <PaginationTable
              totalItems={currentTabPool.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={(page) => {
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page);
                }
              }}
          />
        </div>
      </div>
  );
}