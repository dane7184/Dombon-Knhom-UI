"use client";

import DefaultFallBack from "@public/images/default-fallback-image.png";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/modals/Toast";
import { ArrowLeft2, ArrowRight2, Eye } from "iconsax-react";
import Image from "next/image";
import { Dropdown } from "@/components/dashboard/moderator/Dropdown";
import GenericTable, {
  type ColumnDef,
} from "@/components/dashboard/GenericTable";
import { ReportDetailModal } from "@/components/modals/viewReportDetails";
import { PaginationTable } from "@/components/dashboard/moderator/PaginationTable";
import { resolveUrl } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media";
import {
  useActivityReportDetail,
  useUpdateReportStatus,
} from "@/hooks/admin/useAdminReports";
import { contentTypeStyles } from "@/constant/category.config";
import {
  LocationIcon,
  PeopleIcon,
  CalendarIcon,
} from "@/components/dashboard/system-admin/EventReportDetailHeader";
import {ActivityReportDetail, ActivityReportItem} from "@/types/admin.type";

type SortOrder = "All" | "Newest" | "Oldest";
const SORT_OPTIONS = [
  { value: "All", label: "All" },
  { value: "Newest", label: "Newest" },
  {
    value: "Oldest",
    label: "Oldest",
  },
];

const ITEMS_PER_PAGE = 8;

export default function ReportActivityDetailPage({
  initialData,
}: {
  initialData?: ActivityReportDetail | null;
}) {
  const params = useParams();
  const { toastData, showToast, hideToast } = useToast();

  const reportId = params?.id as string;

  const { data: detail, isLoading: loading } = useActivityReportDetail(
    reportId,
    initialData ?? undefined,
  );

  const { mutate: updateStatus, isPending: isSubmitting } =
    useUpdateReportStatus();
  const currentStatus = detail?.status;
  const [activeThumb, setActiveThumb] = useState(0);
  const [sortOrder, setSortOrder] = useState<SortOrder>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] =
    useState<ActivityReportItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  useEffect(() => {
    thumbRefs.current[activeThumb]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeThumb]);

  const sortedReports = useMemo(() => {
    if (!detail) return [];
    const list = [...detail.reports.content];
    if (sortOrder === "Newest")
      list.sort(
        (a, b) =>
          new Date(b.reportedOn).getTime() - new Date(a.reportedOn).getTime(),
      );
    if (sortOrder === "Oldest")
      list.sort(
        (a, b) =>
          new Date(a.reportedOn).getTime() - new Date(b.reportedOn).getTime(),
      );
    return list;
  }, [detail, sortOrder]);

  const currentData = sortedReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const columns: ColumnDef<ActivityReportItem>[] = [
    {
      header: "No.",
      accessorKey: "reportId",
      width: "5%",
      render: (_r, i) => i + 1,
    },
    {
      header: "Reporter By",
      accessorKey: "reporterBy",
      width: "15%",
      render: (row) => row.reporterBy ? row.reporterBy : "Unknown",
    },
    {
      header: "Reason",
      accessorKey: "reason",
      width: "15%",
      render: (row) => (
        <span className="text-(--secondary-color) font-medium">
          {row.reason}
        </span>
      ),
    },
    {
      header: "Description",
      accessorKey: "details",
      width: "37%",
      render: (row) => (
        <span className="block max-w-xs truncate text-slate-500">
          {row.details ? row.details : "No description"}
        </span>
      ),
    },
    {
      header: "Reported On",
      accessorKey: "reportedOn",
      width: "15%",
      render: (row) => row.reportedOn?.slice(0, 10) ?? "—",
    },
    {
      header: "Action",
      accessorKey: "reportId",
      width: "7%",
      render: (row) => (
        <button
          onClick={() => {
            setSelectedReport(row);
            setIsModalOpen(true);
          }}
          className="p-1 hover:bg-green-100 cursor-pointer rounded-full transition-colors ease-in-out duration-300"
        >
          <Eye
            size={20}
            color="#22c55e"
            className="group-hover:bg-green-100 transition-transform"
          />
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-(--main-color) border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-400">
        <p>Could not load activity detail. Please try again.</p>
      </div>
    );
  }

  const media = detail.media.filter((m) => Boolean(m.url));

  return (
    <div className="flex flex-col h-full gap-4">
      {toastData && (
        <Toast
          type={toastData.type}
          title={toastData.title}
          message={toastData.message}
          onCloseAction={hideToast}
        />
      )}

      {/* Detail Card */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex gap-6">
          {/* Images */}
          <div className="shrink-0 w-1/2 space-y-2">
            <div className="relative rounded-xl overflow-hidden h-90 bg-slate-100">
              {media.length > 0 ? (
                media.map((m, i) =>
                  m.type === "Video" ? (
                    <video
                      key={m.mediaId ?? i}
                      src={resolveMediaUrl(m.url)}
                      controls
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${activeThumb === i ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                    />
                  ) : (
                    <Image
                      key={m.mediaId ?? i}
                      src={resolveUrl(m.url)}
                      alt={`media-${i}`}
                      fill
                      className={`object-cover transition-opacity duration-300 ${activeThumb === i ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                    />
                  ),
                )
              ) : (
                <Image
                  src={DefaultFallBack}
                  alt="fallback"
                  fill
                  className="object-cover"
                />
              )}
              {media.length > 1 && (
                <>
                  <div className="absolute top-2 right-2 z-20 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeThumb + 1} / {media.length}
                  </div>
                  <button
                    onClick={() => setActiveThumb((p) => Math.max(0, p - 1))}
                    disabled={activeThumb === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-white/70 hover:bg-white shadow disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowLeft2 size={14} color="#334155" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveThumb((p) => Math.min(media.length - 1, p + 1))
                    }
                    disabled={activeThumb === media.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-white/70 hover:bg-white shadow disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowRight2 size={14} color="#334155" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {media.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 scroll-smooth">
                {media.map((m, i) => (
                  <button
                    key={m.mediaId ?? i}
                    ref={(el) => {
                      thumbRefs.current[i] = el;
                    }}
                    onClick={() => setActiveThumb(i)}
                    className={`shrink-0 w-11 h-11 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${activeThumb === i ? "border-[#2eb4d3] scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    {m.type === "Video" ? (
                      <video
                        src={resolveMediaUrl(m.url)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={resolveUrl(m.url)}
                        alt={`thumb-${i}`}
                        className="w-full h-full object-cover"
                        width={44}
                        height={44}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 relative mr-6 flex flex-col">
            <div className="absolute top-0 right-0 text-right">
              <p className="text-md font-bold text-(--secondary-color) mb-0.5">
                Total Report
              </p>
              <p className="text-4xl font-bold text-(--secondary-color) leading-none">
                {detail.totalReports}
              </p>
            </div>

            {/* Content grows to fill space */}
            <div className="flex-1">
              <span
                className={`text-sm font-medium px-2 py-0.5 rounded-full border ${contentTypeStyles["Activity"] || ""}`}
              >
                Activity
              </span>

              <p className="text-md text-(--secondary-color) flex font-semiboldflex items-center gap-1.5 mt-2">
                <PeopleIcon />
                Posted by{" "}
                <span className="font-semibold text-(--secondary-color)">
                  {detail.postBy}
                </span>
              </p>
              <p className="text-md text-(--secondary-color) flex items-center gap-1.5 mt-0.5">
                <LocationIcon />
                {detail.province}
              </p>
              <p className="text-md text-(--secondary-color) flex items-center gap-1.5 mt-0.5">
                <CalendarIcon />
                {detail.createdAt?.slice(0, 10)}
              </p>

              <p className="text-md font-semibold text-(--secondary-color) mt-3 mb-1">
                Content
              </p>
              <p className="text-md text-(--secondary-color) leading-relaxed">
                {detail.content}
              </p>

              {detail.tags?.length > 0 && (
                <p className="text-md text-(--main-color) mt-2">
                  #{detail.tags.join(" #")}
                </p>
              )}
            </div>

            {/* Pinned to bottom */}
            {currentStatus === "Pending" && (
              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={() => handleStatusUpdate("Approved")}
                  disabled={isSubmitting}
                  className="bg-(--main-color) w-36 cursor-pointer h-10 rounded-[0.5rem] hover:bg-(--main-color)/80 text-white text-sm font-medium px-4 py-1.5 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate("Rejected")}
                  disabled={isSubmitting}
                  className="bg-(--accent-color) cursor-pointer w-36 h-10 rounded-[0.5rem] hover:bg-(--accent-color)/80 text-white text-sm font-medium px-4 py-1.5 transition-colors"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col flex-1 h-auto">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-base font-bold text-(--main-color)">Reports</h3>
          <div className="flex items-center gap-2 text-sm text-(--secondary-color)">
            <span>Sort by :</span>
            <Dropdown
              value={sortOrder}
              onChange={(val: SortOrder) => {
                setSortOrder(val);
                setCurrentPage(1);
              }}
              options={SORT_OPTIONS}
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          <GenericTable data={currentData} columns={columns} />
        </div>

        <div className="pt-6 shrink-0">
          <PaginationTable
            totalItems={sortedReports.length}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      <ReportDetailModal
        isOpen={isModalOpen}
        report={selectedReport}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReport(null);
        }}
      />
    </div>
  );
}