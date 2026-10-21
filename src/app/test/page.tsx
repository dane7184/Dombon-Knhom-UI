"use client";

import ReportActivityDetailPage from "@/components/dashboard/system-admin/ActivityReportDetail";
import EventReportPage from "@/components/dashboard/system-admin/EventReportDetail";
import QRModal from "@/components/events/QrPayToJoinEvent";
import RatingModal from "@/components/events/RateAndReviewCard";
import ConfirmationModal from "@/components/modals/reportConfirmPopUp";
import ReportDetailModal from "@/components/modals/viewReportDetails";
import { getAllEvents } from "@/services/event.service";

export default async function page() {
  // Debug log to check the response
  return (
    <div>
      {/* <QRModal/>
      <RatingModal/>
      <ReportDetailModal />
      <ConfirmationModal isOpen={true} variant="warning" onClose={() => {}} onConfirm={() => {}} /> */}
      {/* <EventReportPage /> */}
      {/* <ReportActivityDetailPage /> */}
      <div>Hello World!</div>
    </div>
  );
}
