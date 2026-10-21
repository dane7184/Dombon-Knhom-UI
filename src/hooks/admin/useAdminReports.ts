"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useAuth} from "@/hooks/useAuth";
import {
    getActivityFullReportDetail,
    getEventReportDetail,
    getReports,
    updateReportStatus,
} from "@/services/admin.service";
import { reviewReportModerator } from "@/services/moderator.service";
import {ActivityReportDetail, EventReportDetail as EventDetailFromService, FetchReportsParams} from "@/types/admin.type";
import {PaginatedData} from "@/types/common.type";
import {ReportResponse} from "@/types/moderator.type";

export function useAdminReports(params: FetchReportsParams, initialData?: PaginatedData<ReportResponse>) {
    const {isLoading} = useAuth();

    return useQuery({
        queryKey: ["admin", "reports", params],
        queryFn: () => getReports(params),
        enabled: !isLoading,
        initialData,
    });
}

export function useActivityReportDetail(reportId: string, initialData?: ActivityReportDetail) {
    const {isLoading} = useAuth();
    return useQuery({
        queryKey: ["admin", "reports-detail", "activity", reportId],
        queryFn: () => getActivityFullReportDetail(reportId),
        enabled: !isLoading && !!reportId,
        initialData,
    });
}

export function useEventReportDetail(reportId: string, initialData?: EventDetailFromService | null) {
    const {isLoading} = useAuth();

    return useQuery<EventDetailFromService | null>({
        queryKey: ["admin", "reports-detail", "event", reportId],
        queryFn: () => getEventReportDetail(reportId),
        enabled: !isLoading && !!reportId,
        initialData,
    });
}

export function useUpdateReportStatus() {
    const queryClient = useQueryClient();
    const { isModerator } = useAuth();

    return useMutation({
        mutationFn: ({reportId, status}: { reportId: string; status: "Approved" | "Rejected" }) => {
            if (isModerator) {
                return reviewReportModerator(reportId, status);
            }
            return updateReportStatus(reportId, status);
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ["admin", "reports"]}),
                queryClient.invalidateQueries({queryKey: ["admin", "reports-detail"]}),
            ]);
        },
    });
}
