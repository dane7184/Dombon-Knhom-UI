"use server";

import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  toggleLikeService,
  toggleSaveService,
  reportEventService,
  rateEventService,
  joinEventService,
  postCommentService,
  postReplyService,
  editCommentService,
  deleteCommentService,
  toggleFavoriteOrgService,
  toggleFavoriteUserService,
  createEventService,
  updateEventService,
  deleteEventService,
  type CreateEventRequest,
} from "@/services/event.service";
import { JoinEventResult } from "@/types/event.type";
import { ActionRes, ApiErr } from "@/types/common.type";

type ActionResult =
  | { success: true; message: string }
  | { error: string; message: string };
type ActionResultWithData<T> =
  | { success: true; data: T; message: string }
  | { error: string; message: string };

async function handleError(err: Error | Response): Promise<ActionRes<never>> {
  if (err instanceof Response) {
    try {
      const body: ApiErr = await err.json();

      return {
        success: false,
        error: body.detail,
        fieldErrors: body.errors,
      };
    } catch {
      return {
        success: false,
        error: `Request failed (${err.status})`,
      };
    }
  }

  return {
    success: false,
    error: err.message,
  };
}

// ── Create ───────────────────────────────────────────────────────
export async function createEventAction(
  data: CreateEventRequest,
  tokenOverride?: string,
): Promise<ActionRes<{ eventId: string }>> {
  try {
    const created = await createEventService(data, tokenOverride);

    revalidateTag("events", "max");
    return { success: true, data: created };
  } catch (err) {
    return handleError(err as Error | Response);
  }
}

// ── Update ───────────────────────────────────────────────────────
export async function updateEventAction(
  eventId: string,
  data: CreateEventRequest,
  tokenOverride?: string,
): Promise<ActionRes<{ eventId: string }>> {
  try {
    const updated = await updateEventService(eventId, data, tokenOverride);

    revalidateTag("events", "max");
    revalidatePath(`/events/${eventId}`);
    return { success: true, data: updated };
  } catch (err) {
    return handleError(err as Error | Response);
  }
}

// ── Delete ───────────────────────────────────────────────────────
export async function deleteEventAction(
  eventId: string,
  tokenOverride?: string,
): Promise<ActionRes<boolean>> {
  try {
    await deleteEventService(eventId, tokenOverride);

    revalidateTag("events", "max");
    revalidatePath(`/events/${eventId}`);
    return { success: true, data: true };
  } catch (err) {
    return handleError(err as Error | Response);
  }
}

// ── Like ─────────────────────────────────────────────────────────
export async function toggleLikeAction(
  eventId: string,
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized. Please log in." };

  const ok = await toggleLikeService(eventId);
  if (!ok) return { error: "Failed to update like status." };

  revalidateTag("events", "max");
  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

// ── Save ─────────────────────────────────────────────────────────
export async function toggleSaveAction(eventId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user)
    return { error: "Unauthorized", message: "Please log in to save events." };

  const { success, message } = await toggleSaveService(eventId);
  if (!success) return { error: "Failed", message };

  revalidateTag("events", "max");
  revalidatePath(`/events/${eventId}`);
  return { success: true, message };
}

// ── Report (success + error toast) ───────────────────────────────

export async function reportEventAction(
  eventId: string,
  reason: string,
  details: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user)
    return {
      error: "Unauthorized",
      message: "Please log in to report events.",
    };

  const { success, message } = await reportEventService(
    eventId,
    reason,
    details,
  );
  if (!success) return { error: "Failed", message };

  return { success: true, message };
}

// ── Rate (success + error toast) ─────────────────────────────────

export async function rateEventAction(
  eventId: string,
  score: 1 | 2 | 3 | 4 | 5,
  review: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user)
    return {
      error: "Unauthorized",
      message: "Please log in to rate this event.",
    };

  const { success, message } = await rateEventService(eventId, score, review);
  if (!success) return { error: "Failed", message };

  revalidatePath(`/events/${eventId}`);
  return { success: true, message };
}

// ── Join (success + error toast) ──────────────────────────────────

export async function joinEventAction(
  eventId: string,
): Promise<ActionResultWithData<JoinEventResult>> {
  const session = await auth();
  if (!session?.user)
    return {
      error: "Unauthorized",
      message: "Please log in to join this event.",
    };

  const { data, message } = await joinEventService(eventId);
  if (!data) return { error: "Failed", message };

  revalidatePath(`/events/${eventId}`);
  return { success: true, data, message };
}

// ── Post Comment (error toast only) ───────────────────────────────

export async function postCommentAction(
  eventId: string,
  content: string,
): Promise<ActionResultWithData<string>> {
  const session = await auth();
  if (!session?.user)
    return { error: "Unauthorized", message: "Please log in to comment." };

  const commentId = await postCommentService(eventId, content);
  if (!commentId)
    return { error: "Failed", message: "Failed to post comment." };

  revalidatePath(`/events/${eventId}`);
  return { success: true, data: commentId, message: "Comment posted" };
}

// ── Post Reply (error toast only) ─────────────────────────────────

export async function postReplyAction(
  commentId: string,
  content: string,
  eventId: string,
): Promise<ActionResultWithData<string>> {
  const session = await auth();
  if (!session?.user)
    return { error: "Unauthorized", message: "Please log in to reply." };

  const replyId = await postReplyService(commentId, content);
  if (!replyId) return { error: "Failed", message: "Failed to post reply." };

  revalidatePath(`/events/${eventId}`);
  return { success: true, data: replyId, message: "Reply posted" };
}

// ── Edit Comment (success + error toast) ───────────────────────────

export async function editCommentAction(
  commentId: string,
  content: string,
  eventId: string,
): Promise<ActionResultWithData<string>> {
  const session = await auth();
  if (!session?.user)
    return {
      error: "Unauthorized",
      message: "Please log in to edit comments.",
    };

  const { data, message } = await editCommentService(commentId, content);
  if (!data) return { error: "Failed", message };

  revalidatePath(`/events/${eventId}`);
  return { success: true, data, message };
}

// ── Delete Comment (success + error toast) ─────────────────────────

export async function deleteCommentAction(
  commentId: string,
  eventId: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user)
    return {
      error: "Unauthorized",
      message: "Please log in to delete comments.",
    };

  const { success, message } = await deleteCommentService(commentId);
  if (!success) return { error: "Failed", message };

  revalidatePath(`/events/${eventId}`);
  return { success: true, message };
}

// ── Favorite Org (success-only toast) ────────────────────────────────

export async function toggleFavoriteOrgAction(
  orgId: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user)
    return {
      error: "Unauthorized",
      message: "Please log in to favorite organizations.",
    };

  const { success, message } = await toggleFavoriteOrgService(orgId);
  if (!success) return { error: "Failed", message };

  return { success: true, message };
}

// ── Favorite User (success-only toast) ───────────────────────────────

export async function toggleFavoriteUserAction(
  userId: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user)
    return {
      error: "Unauthorized",
      message: "Please log in to favorite users.",
    };

  const { success, message } = await toggleFavoriteUserService(userId);
  if (!success) return { error: "Failed", message };

  return { success: true, message };
}
