"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  postActivityCommentService,
  postActivityReplyService,
  editActivityCommentService,
  deleteActivityCommentService,
  createActivityServer,
  updateActivityServer,
  deleteActivityServer,
} from "@/services/activity.service";
import { ActionRes, ApiErr } from "@/types/common.type";
import { CreateActivityRequest } from "@/types/activity.type";

type ActionResult =
  | { success: true; message: string }
  | { error: string; message: string };
type ActionResultWithData<T> =
  | { success: true; data: T; message: string }
  | { error: string; message: string };

/**
 * Posts a top-level comment on an activity.
 * POST /api/v1/activities/{activityId}/comments
 */
export async function postActivityCommentAction(
  activityId: string,
  content: string,
): Promise<ActionResultWithData<string>> {
  const session = await auth();
  if (!session)
    return { error: "Unauthorized", message: "Please log in to comment." };

  const commentId = await postActivityCommentService(activityId, content);
  if (!commentId)
    return { error: "Failed", message: "Failed to post comment." };

  revalidatePath(`/posts/${activityId}`);
  return { success: true, data: commentId, message: "Comment posted" };
}

/**
 * Posts a reply to a comment OR another reply.
 * POST /api/v1/activities/comments/{commentId}/replies
 * `parentId` can be any comment/reply id (infinite nesting).
 */
export async function postActivityReplyAction(
  parentId: string,
  content: string,
  activityId: string,
): Promise<ActionResultWithData<string>> {
  const session = await auth();
  if (!session)
    return { error: "Unauthorized", message: "Please log in to reply." };

  const replyId = await postActivityReplyService(parentId, content);
  if (!replyId) return { error: "Failed", message: "Failed to post reply." };

  revalidatePath(`/posts/${activityId}`);
  return { success: true, data: replyId, message: "Reply posted" };
}

/**
 * Edits a comment or reply (any depth).
 * PATCH /api/v1/activities/comments/{commentId}
 */
export async function editActivityCommentAction(
  commentId: string,
  content: string,
  activityId: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session)
    return {
      error: "Unauthorized",
      message: "Please log in to edit comments.",
    };

  const { success, message } = await editActivityCommentService(
    commentId,
    content,
  );
  if (!success) return { error: "Failed", message };

  revalidatePath(`/posts/${activityId}`);
  return { success: true, message };
}

/**
 * Deletes a comment or reply (any depth).
 * DELETE /api/v1/activities/comments/{commentId}
 */
export async function deleteActivityCommentAction(
  commentId: string,
  activityId: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session)
    return {
      error: "Unauthorized",
      message: "Please log in to delete comments.",
    };

  const { success, message } = await deleteActivityCommentService(commentId);
  if (!success) return { error: "Failed", message };

  revalidatePath(`/posts/${activityId}`);
  return { success: true, message };
}

async function handleError(err: Error | Response): Promise<ActionRes<never>> {
  if (err instanceof Response) {
    try {
      const body: ApiErr = await err.json();
      return {
        success: false,
        error: body.detail ?? "An unexpected error occurred.",
        fieldErrors: body.errors,
      };
    } catch {
      return { success: false, error: `Request failed (${err.status})` };
    }
  }
  return {
    success: false,
    error: err instanceof Error ? err.message : "An unexpected error occurred.",
  };
}

export async function createActivityAction(
  data: CreateActivityRequest,
): Promise<ActionRes<{ postId?: string; id?: string; activityId?: string }>> {
  try {
    const created = await createActivityServer(data);
    return { success: true, data: created };
  } catch (err) {
    return handleError(err as Error | Response);
  }
}

export async function updateActivityAction(
  activityId: string,
  data: Partial<CreateActivityRequest>,
): Promise<ActionRes<boolean>> {
  try {
    await updateActivityServer(activityId, data);
    return { success: true, data: true };
  } catch (err) {
    return handleError(err as Error | Response);
  }
}

export async function deleteActivityAction(
  activityId: string,
): Promise<ActionRes<boolean>> {
  try {
    await deleteActivityServer(activityId);
    return { success: true, data: true };
  } catch (err) {
    return handleError(err as Error | Response);
  }
}
