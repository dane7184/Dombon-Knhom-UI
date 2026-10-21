"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Tabs } from "@/components/ui/tabs";
import DashboardTabs from "../DashboardTabs";
import SubmissionTable from "@/components/dashboard/moderator/SubmissionTable";
import { Dropdown } from "@/components/dashboard/moderator/Dropdown";
import { PaginationTable } from "@/components/dashboard/moderator/PaginationTable";
import RejectReasonModal from "@/components/modals/rejectedReason";
import {getEventSubmissions, patchEventStatus} from "@/services/moderator.service";
import { EventSubmission as EventSubmissionItem } from "@/types/moderator.type";

export function EventSubmission() {
  const [eventData, setEventData] = useState<EventSubmissionItem[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("moderator_event_tab") || "all";
    }
    return "all";
  });
  const [rejectTarget, setRejectTarget] = useState<EventSubmissionItem | null>(null);

  const itemsPerPage = 11;

  useEffect(() => {
    let cancelled = false;

    getEventSubmissions().then((data) => {
      if (!cancelled) setEventData(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleApproveAction = async (targetEvent: EventSubmissionItem) => {
    const ok = await patchEventStatus(targetEvent.eventId, "Approved");
    if (ok) {
      setEventData((prev) =>
          prev.map((item) =>
              item.eventId === targetEvent.eventId ? {...item, status: "Approved"} : item,
          ),
      );
      toast.success("Event approved.");
    } else {
      toast.error("Failed to approve event. Please try again.");
    }
  };

  const handleRejectAction = (targetEvent: EventSubmissionItem) => {
    setRejectTarget(targetEvent);
  };

  const confirmReject = async (reason: string) => {
    if (!rejectTarget) return;
    const ok = await patchEventStatus(rejectTarget.eventId, "Rejected", reason.trim());
    if (ok) {
      setEventData((prev) =>
          prev.map((item) =>
              item.eventId === rejectTarget.eventId ? {...item, status: "Rejected"} : item,
          ),
      );
      toast.success("Event rejected.");
    } else {
      toast.error("Failed to reject event. Please try again.");
    }
  };

  const sortedData = useMemo(() => {
    return [...eventData].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [sortBy, eventData]);

  const currentTabPool = useMemo(() => {
    if (activeTab === "approved") {
      return sortedData.filter((i) => i.status === "Approved");
    }
    if (activeTab === "reject") {
      return sortedData.filter((i) => i.status === "Rejected");
    }
    // "all" tab: Pending only
    return sortedData.filter((i) => i.status === "Pending");
  }, [activeTab, sortedData]);

  const totalPages = Math.ceil(currentTabPool.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const activePaginatedDataChunk = currentTabPool.slice(indexOfFirstItem, indexOfLastItem);

  const handleTabToggle = (val: string) => {
    setActiveTab(val);
    setCurrentPage(1);
    sessionStorage.setItem("moderator_event_tab", val);
  };

  const tabOptions = [
    {value: "all", label: "All"},
    {value: "approved", label: "Approved"},
    {value: "reject", label: "Rejected"},
  ];

  const sortOptions = [
    {value: "newest", label: "Newest"},
    {value: "oldest", label: "Oldest"},
  ];

  return (
      <div className="bg-white h-full p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
        <Tabs value={activeTab} onValueChange={handleTabToggle} className="w-full flex-1 min-h-0 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <DashboardTabs options={tabOptions}/>

            <div
                className="flex gap-3 items-center w-full sm:w-auto justify-end text-sm font-medium text-(--text-desc)">
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
            <SubmissionTable
                data={activePaginatedDataChunk}
                activeTab={activeTab}
                startIndex={indexOfFirstItem}
                onApproveAction={handleApproveAction}
                onRejectAction={handleRejectAction}
            />
          </div>
        </Tabs>

        {/* FOOTER PAGINATION */}
        <div className="pt-6 border-t border-gray-50 shrink-0">
          <PaginationTable
              totalItems={currentTabPool.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={(page) => {
                if (page <= totalPages && page >= 1) {
                  setCurrentPage(page);
                }
              }}
          />
        </div>

        {/* ── Reject Reason Modal ── */}
        {rejectTarget && (
            <RejectReasonModal
                onClose={() => setRejectTarget(null)}
                onSubmit={(reason) => confirmReject(reason)}
            />
        )}
      </div>
  );
}