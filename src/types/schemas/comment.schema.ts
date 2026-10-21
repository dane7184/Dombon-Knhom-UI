import { z } from "zod";

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment cannot exceed 500 characters"),
});
export const replyCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Reply comment cannot be empty")
    .max(450, "Reply comment cannot exceed 450 characters"),
});
