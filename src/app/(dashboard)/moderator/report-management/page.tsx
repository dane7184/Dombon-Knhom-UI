import React from "react";
import ReportManagement from "@/components/dashboard/moderator/ReportManagement";
import { getReportManagement } from "@/services/moderator.service";

export default async function page() {
    const reportManagementData = await getReportManagement();
    return (
        <div className="h-full">
            <ReportManagement reportManagement={reportManagementData}/>
        </div>
    );
}