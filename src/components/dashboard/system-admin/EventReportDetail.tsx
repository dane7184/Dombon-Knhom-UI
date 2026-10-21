"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/modals/Toast";
import EventHeader from "@/components/dashboard/system-admin/EventReportDetailHeader";
import ReportTab from "@/components/dashboard/system-admin/EventReportDetailTable&Pag";
import EventDetailsTab from "@/components/dashboard/system-admin/EventReportDetailTab";
import EventReportDetailSummary from "@/components/dashboard/system-admin/EventReportDetailSummary";
import {
  useEventReportDetail,
  useUpdateReportStatus,
} from "@/hooks/admin/useAdminReports";
import { EventReportDetail as EventDetailFromService } from "@/types/admin.type";

type Tab = "report" | "event-details";

export default function EventReportPage({
  initialData,
}: {
  initialData?: EventDetailFromService | null;
}) {
  const params = useParams();
  const { toastData, showToast, hideToast } = useToast();
  const reportId = params?.id as string;

  const [activeTab, setActiveTab] = useState<Tab>("report");
  const { data: event, isLoading: loading } = useEventReportDetail(
    reportId,
    initialData,
  );
  const { mutate: updateStatus } = useUpdateReportStatus();
  const currentStatus = event?.status;

  const handleStatusUpdate = (status: "Approved" | "Rejected") => {
    updateStatus(
      { reportId, status },
      {
        onSuccess: () => {
          showToast({
            type: "success",
            title: "Success!",
            message: `Report ${status === "Approved" ? "approved" : "rejected"} successfully.`,
          });
        },
        onError: (err) => {
          console.error("Failed to update reports status:", err);
          showToast({
            type: "error",
            title: "Failed!",
            message: `Could not ${status === "Approved" ? "approve" : "reject"} this report.`,
          });
        },
      },
    );
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-(--main-color) border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-400">
        <p>Could not load event detail. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full space-y-4">
      {toastData && (
        <Toast
          type={toastData.type}
          title={toastData.title}
          message={toastData.message}
          onCloseAction={hideToast}
        />
      )}

      <EventHeader
        event={event}
        reportStatus={currentStatus}
        onApprove={() => handleStatusUpdate("Approved")}
        onReject={() => handleStatusUpdate("Rejected")}
      />

      {/* Tab switcher */}
      <div className="inline-flex items-center gap-1 bg-(--main-color) rounded-lg p-1.5 shadow-lg">
        <TabButton
          label="Report"
          active={activeTab === "report"}
          onClick={() => setActiveTab("report")}
        />
        <TabButton
          label="Event Details"
          active={activeTab === "event-details"}
          onClick={() => setActiveTab("event-details")}
        />
      </div>

      {/* Tab content */}
      {activeTab === "report" && <ReportTab reports={event.reports} />}
      {activeTab === "event-details" && (
        <EventDetailsTab
          detail={event.eventDetail}
          currentStatus={currentStatus}
        />
      )}
    </div>
  );
}

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={active}
      className={`px-6 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 select-none ${
        active
          ? "bg-white text-(--secondary-color) shadow cursor-default"
          : "text-white cursor-pointer hover:bg-white/10"
      }`}
    >
      <span>{label}</span>
    </button>
  );
}
