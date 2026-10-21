import React from "react";
import { X } from "lucide-react";
import { ActivityReportItem } from "@/types/admin.type";
import { Report } from "@/types/eventReport.type";
import { Textarea } from "@/components/ui/textarea";

interface ReportDetailModalProps {
  isOpen: boolean;
  report: Report | ActivityReportItem | null;
  onClose: () => void;
}

export function ReportDetailModal({
  isOpen,
  report,
  onClose,
}: ReportDetailModalProps) {
  if (!isOpen || !report) return null;

  return (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    onClick={onClose}
  >
    <div
      className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-300"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
        aria-label="Close"
      >
        <X size={18} />
      </button>

      {/* Header */}
      <div className="border-b border-gray-100 px-8 py-6">
        <h1 className="text-2xl font-bold text-(--secondary-color)">
          Report Detail
        </h1>
        <p className="mt-1 text-sm text-[#7886a6]">
          Review the submitted report information.
        </p>
      </div>

      {/* Body */}
      <div className="space-y-6 p-8">
        {/* Report By & Report On */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Report By
            </p>
            <p className="mt-2 text-sm font-medium text-(--secondary-color)">
              {report.reporterBy}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Report On
            </p>
            <p className="mt-2 text-sm font-medium text-(--secondary-color)">
              {report.reportedOn.slice(0, 10)}
            </p>
          </div>
        </div>

        {/* Event Reason */}
        <div>
          <p className="mb-2 text-sm font-semibold text-(--secondary-color)">
            Event Reason
          </p>

          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-[#7886a6]">
            {report.reason}
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="mb-2 text-sm font-semibold text-(--secondary-color)">
            Description
          </p>

          <Textarea
            readOnly
            value={
              (report as ActivityReportItem).details ||
              (report as Report).description ||
              ""
            }
            rows={8}
            className="w-full h-30 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#7886a6] focus-visible:border-gray-200 focus-visible:ring-0"
          />
        </div>
      </div>
    </div>
  </div>
);
}

export default ReportDetailModal;
