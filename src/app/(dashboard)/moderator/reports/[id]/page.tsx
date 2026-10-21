import BackButton from "@/components/dashboard/system-admin/BackButton";
import ReportActivityDetailPage from "@/components/dashboard/system-admin/ActivityReportDetail";
import EventReportPage from "@/components/dashboard/system-admin/EventReportDetail";
import {
  getActivityFullReportDetailServer,
  getEventReportDetailServer,
} from "@/services/admin.service";
import { notFound } from "next/navigation";
import { EventStatus } from "@/types/eventReport.type";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { type } = await searchParams;

  if (!type || (type !== "event" && type !== "activity")) notFound();

  const eventInitialData =
    type === "event"
      ? await getEventReportDetailServer(id).catch(() => null)
      : null;

  const activityInitialData =
    type === "activity"
      ? await getActivityFullReportDetailServer(id).catch(() => null)
      : null;

  return (
    <div className="space-y-4">
      <BackButton />

      {type === "event" && eventInitialData && (
        <EventReportPage
          initialData={eventInitialData}/>
      )}

      {type === "activity" && (
        <ReportActivityDetailPage initialData={activityInitialData} />
      )}
    </div>
  );
}
