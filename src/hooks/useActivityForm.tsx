import React, { useState, useCallback, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Toast from "@/components/modals/Toast";
import { useAttendedEvents } from "@/hooks/useCreateActivity";
import { createActivityAction, updateActivityAction } from "@/actions/activity.actions";
import { uploadActivityImages, uploadActivityVideo, removeMediaFromActivity } from "@/services/activity.service";
import {
    ACCEPTED_IMAGE_TYPES,
    MAX_IMAGE_SIZE_BYTES,
    MAX_VIDEO_SIZE_BYTES,
    MAX_IMAGE_COUNT,
    MediaMode,
    AttendedEventItem,
    CreateActivityRequest,
} from "@/types/activity.type";
import { activityContentSchema, activityMediaSchema, ActivityFormValues } from "@/types/schemas/activity.schema";
import { isHeicFile, convertHeicToJpg } from "@/lib/heic";

import { CAMBODIA_PROVINCES } from "@/constant/province";

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function isImageFile(file: File): boolean {
    return ACCEPTED_IMAGE_TYPES.includes(file.type);
}

function isVideoFile(file: File): boolean {
    return file.type.startsWith("video/");
}

export interface PreviewFile {
    id: string;
    name: string;
    size: number;
    sizeLabel: string;
    preview: string;
    file: File;
    type: "image" | "video";
    isExisting?: boolean;
    originalUrl?: string;
}

interface UseActivityFormProps {
    initialData?: {
        activityId: string;
        content: string;
        tags: string[];
        location: string;
        event: string;
        files: { id: string | number; preview: string; type?: "image" | "video" }[];
    };
    onSuccess?: (newData?: { content: string; location: string; tags: string[] }) => void;
    onClose?: () => void;
}

export function useActivityForm({ initialData, onSuccess, onClose }: UseActivityFormProps) {
    const parsedProvince = (() => {
        if (!initialData?.location) return "";
        const loc = initialData.location.toLowerCase();
        const matched = CAMBODIA_PROVINCES.find(p =>
            loc.includes(p.label.toLowerCase()) || loc.includes(p.value.toLowerCase().replace(/_/g, " "))
        );
        return matched ? matched.value : "";
    })();

    const {
        register,
        handleSubmit: handleFormSubmit,
        watch,
        setValue,
    } = useForm<ActivityFormValues>({
        resolver: zodResolver(activityContentSchema),
        defaultValues: {
            content: initialData?.content || "",
            province: parsedProvince,
            eventId: initialData?.event || "",
            tags: initialData?.tags || [],
        },
    });

    const content = watch("content");
    const province = watch("province");
    const tags = watch("tags");

    const [tagInput, setTagInput] = useState("");

    const [selectedEvent, setSelectedEventState] = useState<AttendedEventItem | null>(null);
    const setSelectedEvent = useCallback(
        (ev: AttendedEventItem | null) => {
            setSelectedEventState(ev);
            setValue("eventId", ev?.eventId ?? "", { shouldValidate: true });
        },
        [setValue]
    );

    const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>(
        initialData?.files.map(f => {
            const isVideo = f.type === "video" ||
                f.preview.endsWith(".mp4") ||
                f.preview.endsWith(".webm") ||
                f.preview.endsWith(".mov") ||
                f.preview.includes("media/videos/");
            return {
                id: f.id.toString(),
                name: "Existing Media",
                size: 0,
                sizeLabel: "Saved",
                preview: f.preview,
                file: new File([""], "existing"),
                type: (f.type || (isVideo ? "video" : "image")) as "image" | "video",
                isExisting: true,
                originalUrl: f.preview,
            };
        }) || []
    );

    const [mediaMode, setMediaMode] = useState<MediaMode>(
        initialData?.files?.length ? (initialData.files[0].type === "video" || initialData.files[0].preview.endsWith(".mp4") ? "video" : "images") : null
    );

    const [showProvinceSelect, setShowProvinceSelect] = useState(false);
    const [showEventSelect, setShowEventSelect] = useState(false);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const [mediaError, setMediaError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: attendedEvents, isLoading: isLoadingEvents } = useAttendedEvents();

    useEffect(() => {
        if (initialData?.event && attendedEvents && !selectedEvent) {
            const ev = attendedEvents.find(e => e.eventId.toString() === initialData.event);
            if (ev) setSelectedEvent(ev);
        }
    }, [initialData?.event, attendedEvents, selectedEvent, setSelectedEvent]);

    const isContentInvalid = !activityContentSchema.shape.content.safeParse(content).success;
    const isProvinceInvalid = !activityContentSchema.shape.province.safeParse(province).success;
    const isEventInvalid = false; // Event linking is optional

    const mediaValidation = activityMediaSchema.safeParse(previewFiles);
    const isMediaInvalid = !mediaValidation.success;
    const mediaRequirementError = mediaValidation.success ? null : mediaValidation.error.issues[0]?.message;

    const isFormInvalid = isContentInvalid || isProvinceInvalid || isEventInvalid || isMediaInvalid;

    const setContent = useCallback(
        (value: string) => setValue("content", value, { shouldValidate: hasAttemptedSubmit }),
        [setValue, hasAttemptedSubmit]
    );

    const setProvince = useCallback(
        (value: string) => setValue("province", value, { shouldValidate: hasAttemptedSubmit }),
        [setValue, hasAttemptedSubmit]
    );

    const setTags = useCallback(
        (updater: string[] | ((prev: string[]) => string[])) => {
            const next = typeof updater === "function" ? updater(tags) : updater;
            setValue("tags", next, { shouldValidate: hasAttemptedSubmit });
        },
        [setValue, tags, hasAttemptedSubmit]
    );

    const handleProcessFiles = useCallback(
        async (filesList: FileList | File[]) => {
            setMediaError(null);
            const rawIncoming = Array.from(filesList);

            // Convert HEIC files if necessary
            const incoming = await Promise.all(
                rawIncoming.map(async (file) => {
                    if (await isHeicFile(file)) {
                        try {
                            return await convertHeicToJpg(file);
                        } catch (e) {
                            console.error("Failed to convert HEIC", e);
                            return file;
                        }
                    }
                    return file;
                })
            );

            const hasImages = incoming.some(isImageFile);
            const hasVideos = incoming.some(isVideoFile);

            if (hasImages && hasVideos) {
                setMediaError("You cannot upload images and video together. Choose one type.");
                return;
            }

            if (mediaMode === "images" && hasVideos) {
                setMediaError("You already have images selected. Remove them to upload a video instead.");
                return;
            }
            if (mediaMode === "video" && hasImages) {
                setMediaError("You already have a video selected. Remove it to upload images instead.");
                return;
            }

            if (hasVideos || (mediaMode === null && incoming.length === 1 && isVideoFile(incoming[0]))) {
                if (incoming.length > 1) {
                    setMediaError("Only one video file is allowed.");
                    return;
                }
                const videoFile = incoming[0];
                if (videoFile.size > MAX_VIDEO_SIZE_BYTES) {
                    setMediaError(`Video must be under 50MB. This file is ${formatFileSize(videoFile.size)}.`);
                    return;
                }
                if (previewFiles.length > 0 && mediaMode === "video") {
                    setMediaError("Only one video file is allowed. Remove the current one first.");
                    return;
                }

                const preview: PreviewFile = {
                    id: crypto.randomUUID(),
                    name: videoFile.name,
                    size: videoFile.size,
                    sizeLabel: formatFileSize(videoFile.size),
                    preview: URL.createObjectURL(videoFile),
                    file: videoFile,
                    type: "video",
                };
                setPreviewFiles([preview]);
                setMediaMode("video");
                return;
            }

            const validImages: PreviewFile[] = [];
            const errors: string[] = [];

            for (const file of incoming) {
                if (!isImageFile(file)) {
                    errors.push(`"${file.name}" is not a supported image format (JPG, JPEG, PNG, WEBP).`);
                    continue;
                }
                if (file.size > MAX_IMAGE_SIZE_BYTES) {
                    errors.push(`"${file.name}" exceeds 5MB (${formatFileSize(file.size)}).`);
                    continue;
                }
                validImages.push({
                    id: crypto.randomUUID(),
                    name: file.name,
                    size: file.size,
                    sizeLabel: formatFileSize(file.size),
                    preview: URL.createObjectURL(file),
                    file,
                    type: "image",
                });
            }

            const totalAfter = previewFiles.length + validImages.length;
            if (totalAfter > MAX_IMAGE_COUNT) {
                setMediaError(`Maximum ${MAX_IMAGE_COUNT} images allowed. You have ${previewFiles.length}, trying to add ${validImages.length}.`);
                return;
            }

            if (errors.length > 0) {
                setMediaError(errors.join(" "));
                return;
            }

            if (validImages.length > 0) {
                setPreviewFiles((prev) => [...prev, ...validImages]);
                setMediaMode("images");
            }
        },
        [mediaMode, previewFiles.length]
    );

    const handleDeleteFile = (id: string) => {
        const toRemove = previewFiles.find((f) => f.id === id);

        if (toRemove?.isExisting) {
            setFilesToDelete(curr => [...curr, toRemove.id]);
        }

        setPreviewFiles((prev) => {
            const fileToRemove = prev.find((f) => f.id === id);
            if (fileToRemove && fileToRemove.preview.startsWith("blob:")) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            const remaining = prev.filter((f) => f.id !== id);
            if (remaining.length === 0) {
                setMediaMode(null);
                setMediaError(null);
            }
            return remaining;
        });
    };

    const processTagInput = (raw: string) => {
        const formattedTag = raw.trim().replace(/#/g, "").replace(/,/g, "").replace(/\s+/g, "");
        if (formattedTag && formattedTag.length <= 50 && tags.length < 20 && !tags.includes(formattedTag)) {
            setTags((prev) => [...prev, formattedTag]);
        }
        setTagInput("");
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === "," || e.key === " ") {
            e.preventDefault();
            processTagInput(tagInput);
        } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
            setTags((prev) => prev.slice(0, -1));
        }
    };

    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val.includes(",") || val.includes(" ")) {
            const parts = val.split(/[, ]+/);
            parts.forEach((part) => {
                const trimmed = part.trim().replace(/#/g, "").replace(/\s+/g, "");
                if (trimmed && trimmed.length <= 50 && tags.length < 20 && !tags.includes(trimmed)) {
                    setTags((prev) => {
                        if (prev.length < 20 && !prev.includes(trimmed)) return [...prev, trimmed];
                        return prev;
                    });
                }
            });
            setTagInput("");
        } else {
            setTagInput(val);
        }
    };

    const handleSubmit = handleFormSubmit(
        async (data) => {
            setHasAttemptedSubmit(true);

            if (isMediaInvalid || isSubmitting) return;

            setIsSubmitting(true);
            const payload = {
                content: data.content,
                isPublished: true,
                province: data.province,
                eventId: data.eventId || undefined,
                tags: data.tags,
            };

            try {
                if (initialData) {
                    const activityId = initialData.activityId;
                    const res = await updateActivityAction(activityId, payload);
                    if (!res.success) throw new Error(res.error);

                    const newFiles = previewFiles.filter(f => !f.isExisting && f.file.size > 0).map(f => f.file);

                    if (filesToDelete.length > 0 || newFiles.length > 0) {
                        for (const mediaId of filesToDelete) {
                            try {
                                await removeMediaFromActivity(initialData.activityId, mediaId);
                            } catch (e: unknown) {
                                console.error(`Failed to delete ${mediaId}:`, e);
                            }
                        }

                        if (newFiles.length > 0) {
                            if (mediaMode === "video") {
                                await uploadActivityVideo(initialData.activityId, newFiles[0]);
                            } else {
                                await uploadActivityImages(initialData.activityId, newFiles);
                            }
                        }
                    }

                    toast.custom((t) => (
                        <Toast title="Success" message="Post updated successfully" type="success" onCloseAction={() => toast.dismiss(t)} />
                    ));
                } else {
                    const res = await createActivityAction(payload as CreateActivityRequest);
                    if (!res.success) throw new Error(res.error);
                    const activityId = res.data.postId || res.data.id || res.data.activityId;
                    if (!activityId) throw new Error("Activity ID not returned.");

                    const newFiles = mediaMode === "images" ? previewFiles.map((f) => f.file) : [];
                    const newVideo = mediaMode === "video" ? previewFiles[0]?.file ?? null : null;

                    if (mediaMode === "images" && newFiles.length > 0) {
                        await uploadActivityImages(activityId, newFiles);
                    } else if (mediaMode === "video" && newVideo) {
                        await uploadActivityVideo(activityId, newVideo);
                    }

                    toast.custom((t) => (
                        <Toast title="Activity posted successfully" message="Your activity is now live on the feed." type="success" onCloseAction={() => toast.dismiss(t)} />
                    ));
                }
                // Wait briefly for backend database to fully sync the new post and media
                await new Promise(resolve => setTimeout(resolve, 1500));

                if (onSuccess) {
                    await onSuccess();
                }
                onClose?.();
            } catch (error) {
                toast.custom((t) => (
                    <Toast
                        title="Error"
                        message={error instanceof Error ? error.message : "Something went wrong. Please try again."}
                        type="error"
                        onCloseAction={() => toast.dismiss(t)}
                    />
                ));
            } finally {
                setIsSubmitting(false);
            }
        },
        () => {
            setHasAttemptedSubmit(true);
        }
    );

    return {
        content, setContent,
        tags, setTags,
        tagInput, setTagInput,
        province, setProvince,
        selectedEvent, setSelectedEvent,
        previewFiles, setPreviewFiles,
        mediaMode, setMediaMode,
        showProvinceSelect, setShowProvinceSelect,
        showEventSelect, setShowEventSelect,
        hasAttemptedSubmit, setHasAttemptedSubmit,
        mediaError, setMediaError,
        mediaRequirementError,
        isSubmitting,
        fileInputRef,
        attendedEvents, isLoadingEvents,
        isContentInvalid, isProvinceInvalid, isEventInvalid, isMediaInvalid, isFormInvalid,
        handleProcessFiles, handleDeleteFile,
        processTagInput, handleTagKeyDown, handleTagInputChange,
        handleRemoveTag: (tag: string) => setTags((prev) => prev.filter((t) => t !== tag)),
        handleSubmit,
        register,
    };
}
