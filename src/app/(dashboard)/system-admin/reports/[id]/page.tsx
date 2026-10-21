import React from "react";
import BackButton from "@/components/dashboard/system-admin/BackButton";
import ReportActivityDetailPage from "@/components/dashboard/system-admin/ActivityReportDetail";
import EventReportPage from "@/components/dashboard/system-admin/EventReportDetail";
import {
  getActivityFullReportDetailServer,
  getEventReportDetailServer,
} from "@/services/admin.service";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { type } = await searchParams;

  const eventInitialData =
    type === "event"
      ? await getEventReportDetailServer(id).catch(() => null)
      : null;

  const activityInitialData =
    type === "activity"
      ? await getActivityFullReportDetailServer(id).catch(() => null)
      : null;

  if (!type || (type !== "event" && type !== "activity")) notFound();

  if (!eventInitialData && !activityInitialData) {
    redirect("/system-admin/reports");
  }

  return (
    <div className="space-y-4 h-full">
      <BackButton />
      {type === "event" && <EventReportPage initialData={eventInitialData} />}
      {type === "activity" && (
        <ReportActivityDetailPage initialData={activityInitialData} />
      )}
    </div>
  );
}
