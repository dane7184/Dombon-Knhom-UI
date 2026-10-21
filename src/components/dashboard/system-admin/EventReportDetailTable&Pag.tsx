"use client";

import { useState, useMemo } from "react";
import { Report } from "@/types/eventReport.type";
import GenericTable, {
  type ColumnDef,
} from "@/components/dashboard/GenericTable";
import { Eye } from "lucide-react";
import { Dropdown } from "@/components/dashboard/moderator/Dropdown";
import { ReportDetailModal } from "@/components/modals/viewReportDetails";
import { PaginationTable } from "@/components/dashboard/moderator/PaginationTable";

const ITEMS_PER_PAGE = 8;

// option drop down
const FILTER_OPTIONS = [
  { value: "All", label: "All" },
  { value: "Harassment", label: "Harassment" },
  { value: "Violence", label: "Violence" },
  { value: "Inappropriate", label: "Inappropriate" },
  { value: "Fake Event", label: "Fake Event" },
  { value: "Spam", label: "Spam" },
];

interface ReportTabProps {
  reports: Report[];
}

// columns
const getColumns = (
  onViewDetail: (report: Report) => void,
): ColumnDef<Report>[] => [
  { header: "No.", accessorKey: "id", width: "5%",render: (row, index) => index + 1, },
  { header: "Reporter By", accessorKey: "reporterBy", width: "15%" },
  {
    header: "Reason",
    accessorKey: "reason",
    width: "12%",
    render: (row) => (
      <span className="block truncate text-(--secondary-color) font-medium" title={row.reason}>
        {row.reason}
      </span>
    ),
  },
  {
    header: "Description",
    accessorKey: "description",
    width: "35%",
    render: (row) => (
      <span className="block max-w-xs truncate text-slate-500">
        {row.description}
      </span>
    ),
  },
  { header: "Reported On", accessorKey: "reportedOn", width: "15%",render: (row) => row.reportedOn ? row.reportedOn.slice(0, 10) : "—", },
  {
    header: "Action",
    accessorKey: "id",
    width: "7%",
    // click to see details in modal
    render: (row) => (
      <button
        onClick={() => onViewDetail(row)}
        className="p-1 hover:bg-green-100 cursor-pointer rounded-full transition-colors ease-in-out duration-300"
      >
        <Eye
          size={20}
          color="#22c55e"
          className="group-hover:scale-110 transition-transform"
        />
      </button>
    ),
  },
];

export default function ReportTab({ reports }: ReportTabProps) {
  const [page, setPage] = useState(1);
  const [filterReason, setFilterReason] = useState("All");

  // Modal state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // filter reports based on selected reason
  const filteredReports = useMemo(() => {
    if (filterReason === "All") return reports;
    return reports.filter((r) => r.reason === filterReason);
  }, [reports, filterReason]);

  const paginated = filteredReports.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  // open
  const handleOpenModal = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const handleFilterChange = (value: string) => {
    setFilterReason(value);
    setPage(1);
  };

  return (
    <>
      <div className="bg-white h-full rounded-xl shadow-sm p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-(--secondary-color) text-base">Reports</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Sort by :</span>
            <Dropdown
              value={filterReason}
              onChange={handleFilterChange}
              options={FILTER_OPTIONS}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto h-full">
          <GenericTable
            data={paginated}
            columns={getColumns(handleOpenModal)}
          />
        </div>

        {/* Pagination */}
        <div className="pt-6 shrink-0">
          <PaginationTable
            totalItems={filteredReports.length}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      <ReportDetailModal
        isOpen={isModalOpen}
        report={selectedReport}
        onClose={handleCloseModal}
      />
    </>
  );
}