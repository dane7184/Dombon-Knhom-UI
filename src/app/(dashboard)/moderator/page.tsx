import React from "react";
import ChartPieDonut from "@/components/dashboard/moderator/PieChart";
import OrganizationRequestTable from "@/components/dashboard/moderator/OrganizationRequestTable";
import RecentPendingEventTable from "@/components/dashboard/moderator/RecentPendingEventTable";
import ReportedEventTable from "@/components/dashboard/moderator/ReportedEventTable";
import ModeratorKpiGrid from "@/components/dashboard/moderator/ModeratorKpiGrid";
import {
    getDashboardSummary,
    getDashboardPendingEvents,
    getDashboardReportedEvents,
    getDashboardOrganizerRequests,
} from "@/services/moderator.service";

export default async function Page() {
    const [summary, pendingEvents, reportedEvents, organizerRequests] =
        await Promise.all([
            getDashboardSummary(),
            getDashboardPendingEvents(),
            getDashboardReportedEvents(),
            getDashboardOrganizerRequests(),
        ]);

    return (
        <div className="flex flex-col h-full gap-4">
            <ModeratorKpiGrid mockModerator={summary} />
            <div className="flex gap-4 shrink-0">
                <div className="w-[40%]">
                    <ChartPieDonut {...summary} />
                </div>
                <div className="w-[60%]">
                    <RecentPendingEventTable data={pendingEvents} />
                </div>
            </div>

            <div className="flex gap-4 flex-1 min-h-0">
                <div className="w-[50%] overflow-auto h-full">
                    <OrganizationRequestTable data={organizerRequests.slice(0, 6)} />
                </div>
                <div className="w-[50%] overflow-auto h-full">
                    <ReportedEventTable data={reportedEvents.slice(0, 6)} />
                </div>
            </div>
        </div>
    );
}