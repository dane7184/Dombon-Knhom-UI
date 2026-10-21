"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchMyAttendedEvents,
    createActivity,
    uploadActivityImages,
    uploadActivityVideo,
} from "@/services/activity.service";
import {
    CreateActivityRequest,
    AttendedEventItem,
    MediaMode,
} from "@/types/activity.type";

export function useAttendedEvents() {
    return useQuery<AttendedEventItem[]>({
        queryKey: ["attended-events", "v2"],
        queryFn: fetchMyAttendedEvents,
    });
}

interface SubmitActivityParams {
    request: CreateActivityRequest;
    images: File[];
    video: File | null;
    mediaMode: MediaMode;
    existingActivityId?: string | null;
}

export function useCreateActivity(
    onSuccess?: () => void,
    onActivityCreated?: (activityId: string) => void
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ request, images, video, mediaMode, existingActivityId }: SubmitActivityParams) => {
            let activityId = existingActivityId;
            
            if (!activityId) {
                const res = await createActivity(request);
                activityId = res.activityId;
                onActivityCreated?.(activityId);
            }

            if (mediaMode === "images" && images.length > 0) {
                await uploadActivityImages(activityId, images);
            }

            if (mediaMode === "video" && video) {
                await uploadActivityVideo(activityId, video);
            }

            return activityId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["activities"] });
            onSuccess?.();
        },
    });
}
