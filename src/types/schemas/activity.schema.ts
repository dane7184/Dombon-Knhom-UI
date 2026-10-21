import {z} from "zod";
import {CAMBODIA_PROVINCES} from "@/constant/province";
import {MAX_IMAGE_COUNT, MAX_IMAGE_SIZE_BYTES, MAX_VIDEO_SIZE_BYTES} from "@/types/activity.type";
const VID_EXTS = /\.(mp4|webm|mkv|avi)(\/stream)?$/i;
const PROVINCE_VALUES = CAMBODIA_PROVINCES.map((p) => p.value);
const MAX_WORD_LENGTH = 25;

export const activityContentSchema = z.object({
    content: z
        .string()
        .trim()
        .min(1, "Content is required.")
        .max(500, "Content cannot exceed 500 characters.")
        .refine(
            (value) => !value.split(/\s+/).some((word) => word.length > MAX_WORD_LENGTH && !word.startsWith("http")),
            "Words cannot exceed 25 characters without spaces."
        ),
    province: z
        .string()
        .min(1, "Province is required.")
        .refine((value) => PROVINCE_VALUES.includes(value), "Invalid province selected."),
    eventId: z.union([z.uuid(), z.literal("")]).optional(),
    tags: z
        .array(z.string().max(50, "Tag cannot exceed 50 characters."))
        .max(20, "Maximum 20 tags allowed."),
});

export type ActivityFormValues = z.infer<typeof activityContentSchema>;

export const activityMediaSchema = z
    .array(
        z.object({
            name: z.string(),
            size: z.number(),
            type: z.enum(["image", "video"]),
            isExisting: z.boolean().optional(),
        })
    )
    .min(1, "At least one image or a video is required.")
    .max(MAX_IMAGE_COUNT, `Maximum ${MAX_IMAGE_COUNT} images allowed.`)
    .superRefine((files, ctx) => {
        const images = files.filter((f) => f.type === "image");
        const videos = files.filter((f) => f.type === "video");

        if (images.length > 0 && videos.length > 0) {
            ctx.addIssue({
                code: "custom",
                message: "You cannot upload images and video together.",
            });
        }

        if (videos.length > 1) {
            ctx.addIssue({
                code: "custom",
                message: "Only one video file is allowed.",
            });
        }

        images.forEach((file) => {
            if (!file.isExisting && file.size > MAX_IMAGE_SIZE_BYTES) {
                ctx.addIssue({
                    code: "custom",
                    message: `"${file.name}" exceeds 5MB.`,
                });
            }
        });

        videos.forEach((file) => {
            const isValidVideo = VID_EXTS.test(file.name);

            if (!isValidVideo) {
                ctx.addIssue({
                    code: "custom",
                    message: `"${file.name}" is not a supported video format. Allowed formats: MP4, WebM, MKV, AVI.`,
                });
            }

            if (!file.isExisting && file.size > MAX_VIDEO_SIZE_BYTES) {
                ctx.addIssue({
                    code: "custom",
                    message: `"${file.name}" exceeds 50MB.`,
                });
            }
        });
    });
export type ActivityMediaInput = z.infer<typeof activityMediaSchema>;
