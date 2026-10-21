"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send2 } from "iconsax-react";
import { EventComment } from "@/types/event.type";
import {
  getActivityCommentReplies,
  loadMoreActivityComments,
} from "@/services/activity.service";
import { useEventStore } from "@/store/useEventStore";
import { useSession } from "next-auth/react";
import { MeData } from "@/types/auth.types";
import { resolveAvatarUrl } from "@/lib/format";
import Image from "next/image";
import {
  deleteActivityCommentAction,
  editActivityCommentAction,
  postActivityCommentAction,
  postActivityReplyAction,
} from "@/actions/activity.actions";
import {
  CommentNode,
  getEditableContent,
  parseMention,
} from "../events/CommentNode";
import {
  findNode,
  updateNode,
  removeNode,
  insertReply,
  mergeReplies,
} from "@/lib/comment-tree";
import { commentSchema } from "@/types/schemas/comment.schema";
import {
  ActivityComment,
  ActivityCommentComponent as ActivityCommentData,
  PostDetail,
} from "@/types/activity.type";
import { toast } from "sonner";
import Toast from "../modals/Toast";
import { useAuth } from "@/hooks/useAuth";

interface ActivityCommentComponentProps {
  comment: ActivityCommentData;
  post: PostDetail;
  me: MeData | null;
}

export const ActivityCommentComponent = ({
  comment,
  post,
  me,
}: ActivityCommentComponentProps) => {
  const { addComment, addReply, totalComments } = useEventStore();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const targetCommentId = searchParams.get("commentId");
  const targetParentId = searchParams.get("parentId");
  const [highlightId, setHighlightId] = useState<string | null>(
    targetCommentId,
  );

  // Activities have no "ended" state — commenting is always open
  const isEventEnded = false;
  const { isOrgMode } = useAuth();

  const currentUserName = isOrgMode
    ? (me?.orgName ?? "Organizer")
    : (me?.fullName ?? "You");
  const currentUserAvatar = isOrgMode
    ? (me?.orgLogo ?? null)
    : (me?.avatar ?? null);

  const [comments, setComments] = useState<EventComment[]>(comment.comments);
  const [nextCursor, setNextCursor] = useState(comment.nextCursor);
  const [hasNext, setHasNext] = useState(comment.hasNext);
  const [inputValue, setInputValue] = useState("");
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInputs, setEditInputs] = useState<Record<string, string>>({});
  // Dropdown menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Validation errors
  const [commentError, setCommentError] = useState<string | null>(null);
  const [replyErrors, setReplyErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // ── Close menu on outside click ───────────────────────────────
  useEffect(() => {
    if (!openMenuId) return;

    function handleClick() {
      setOpenMenuId(null);
    }

    const timer = setTimeout(() => {
      document.addEventListener("click", handleClick);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClick);
    };
  }, [openMenuId]);

  // ── Post Comment (top-level, parentId = null) ─────────────────
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = commentSchema.safeParse({ content: inputValue });
    if (!validation.success) {
      setCommentError(validation.error.issues[0].message);
      return;
    }
    setCommentError(null);

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimistic: EventComment = {
      id: tempId,
      content: inputValue,
      isEdited: false,
      postedAt: "Posting...",
      createdAt: new Date().toISOString(),
      parentId: null,
      author: {
        id: isOrgMode ? (me?.orgId ?? "me") : (session?.user?.userId ?? "me"),
        name: currentUserName,
        avatarUrl: currentUserAvatar ?? "",
        isOrganizer: isOrgMode,
      },
      userId: isOrgMode ? null : (session?.user?.userId ?? null),
      fullName: isOrgMode ? null : (me?.fullName ?? null),
      avatar: isOrgMode ? null : (me?.avatar ?? null),
      orgId: isOrgMode ? (me?.orgId ?? null) : null,
      orgName: isOrgMode ? (me?.orgName ?? null) : null,
      orgAvatar: isOrgMode ? (me?.orgLogo ?? null) : null,
      hasReply: false,
      replies: [],
      repliesLoaded: false,
      hasMoreReplies: false,
      repliesNextCursor: null,
    };

    setComments((prev) => [optimistic, ...prev]);
    addComment();
    const saved = inputValue;
    setInputValue("");

    const result = await postActivityCommentAction(post.postId, saved);

    if ("success" in result) {
      setComments((prev) =>
        updateNode(prev, tempId, (n) => ({
          ...n,
          id: result.data,
          postedAt: "Just now",
        })),
      );
    } else {
      setComments((prev) => removeNode(prev, tempId));
      useEventStore.setState((s) => ({ totalComments: s.totalComments - 1 }));
      setInputValue(saved);
    }
  };

  // ── Post Reply — parentId is whatever node's Reply button was clicked ──
  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();

    const content = replyInputs[parentId]?.trim() ?? "";

    const validation = commentSchema.safeParse({ content });
    if (!validation.success) {
      setReplyErrors((prev) => ({
        ...prev,
        [parentId]: validation.error.issues[0].message,
      }));
      return;
    }
    setReplyErrors((prev) => ({ ...prev, [parentId]: "" }));

    const parentNode = findNode(comments, parentId);
    if (!parentNode) return;

    // Encode @mention pointing at the author being replied to
    const payloadContent = `@{${parentNode.author.id}|${parentNode.author.name}} ${content}`;

    const tempReplyId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimistic: EventComment = {
      id: tempReplyId,
      parentId,
      content: payloadContent,
      isEdited: false,
      postedAt: "Posting...",
      createdAt: new Date().toISOString(),
      author: {
        id: isOrgMode ? (me?.orgId ?? "me") : (session?.user?.userId ?? "me"),
        name: currentUserName,
        avatarUrl: currentUserAvatar ?? "",
        isOrganizer: isOrgMode,
      },
      userId: isOrgMode ? null : (session?.user?.userId ?? null),
      fullName: isOrgMode ? null : (me?.fullName ?? null),
      avatar: isOrgMode ? null : (me?.avatar ?? null),
      orgId: isOrgMode ? (me?.orgId ?? null) : null,
      orgName: isOrgMode ? (me?.orgName ?? null) : null,
      orgAvatar: isOrgMode ? (me?.orgLogo ?? null) : null,
      hasReply: false,
      replies: [],
      repliesLoaded: false,
      hasMoreReplies: false,
      repliesNextCursor: null,
    };

    setComments((prev) => insertReply(prev, parentId, optimistic));
    addReply();
    setReplyInputs((prev) => ({ ...prev, [parentId]: "" }));
    setActiveReplyBox(null);

    const result = await postActivityReplyAction(
      parentId,
      payloadContent,
      post.postId,
    );

    if ("success" in result) {
      setComments((prev) =>
        updateNode(prev, tempReplyId, (n) => ({
          ...n,
          id: result.data,
          postedAt: "Just now",
        })),
      );
    } else {
      setComments((prev) => removeNode(prev, tempReplyId));
      useEventStore.setState((s) => ({ totalComments: s.totalComments - 1 }));
    }
  };

  // ── Edit Comment or Reply ─────────────────────────────────────
  const handleEditSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();

    const editedText = editInputs[id]?.trim() ?? "";

    const validation = commentSchema.safeParse({ content: editedText });
    if (!validation.success) {
      setEditErrors((prev) => ({
        ...prev,
        [id]: validation.error.issues[0].message,
      }));
      return;
    }
    setEditErrors((prev) => ({ ...prev, [id]: "" }));

    const node = findNode(comments, id);
    if (!node) return;

    const original = node.content;

    // Re-attach the mention prefix (if any) so the @mention link is preserved
    const parsed = parseMention(original);
    const newContent = parsed
      ? `@{${parsed.userId}|${parsed.userName}} ${editedText}`
      : editedText;

    setComments((prev) =>
      updateNode(prev, id, (n) => ({
        ...n,
        content: newContent,
        isEdited: true,
      })),
    );
    setEditingId(null);

    const result = await editActivityCommentAction(id, newContent, post.postId);
    if ("error" in result) {
      setComments((prev) =>
        updateNode(prev, id, (n) => ({
          ...n,
          content: original,
          isEdited: false,
        })),
      );
      toast.custom((t) => (
        <Toast
          title="Error"
          message={result.message}
          type="error"
          onCloseAction={() => toast.dismiss(t)}
        />
      ));
    } else {
      toast.custom((t) => (
        <Toast
          title="Success"
          message={result.message}
          type="success"
          onCloseAction={() => toast.dismiss(t)}
        />
      ));
    }
  };

  // ── Delete Comment or Reply ────────────────────────────────────
  const handleDeleteConfirm = async (id: string) => {
    setDeletingId(null);

    const isTopLevel = comments.some((c) => c.id === id);

    setComments((prev) => removeNode(prev, id));
    if (isTopLevel) {
      useEventStore.setState((s) => ({ totalComments: s.totalComments - 1 }));
    }

    const result = await deleteActivityCommentAction(id, post.postId);
    if ("error" in result) {
      toast.custom((t) => (
        <Toast
          title="Error"
          message={result.message}
          type="error"
          onCloseAction={() => toast.dismiss(t)}
        />
      ));
    } else {
      toast.custom((t) => (
        <Toast
          title="Success"
          message={result.message}
          type="success"
          onCloseAction={() => toast.dismiss(t)}
        />
      ));
    }
  };

  // ── Load More Top-Level Comments ───────────────────────────────
  const handleLoadMore = async () => {
    if (!nextCursor) return;

    const mapped = await loadMoreActivityComments(post.postId, nextCursor, 5);
    if (!mapped) return;

    setComments((prev) => [...prev, ...mapped.comments]);
    setNextCursor(mapped.nextCursor);
    setHasNext(mapped.hasNext);
  };

  // ── Load Replies for any node (comment or nested reply) ────────
  const handleLoadReplies = async (nodeId: string) => {
    const node = findNode(comments, nodeId);
    if (!node) return;

    const result = await getActivityCommentReplies(
      nodeId,
      node.repliesNextCursor,
      5,
    );

    setComments((prev) =>
      mergeReplies(prev, nodeId, result.replies, {
        hasMoreReplies: result.hasNext,
        repliesNextCursor: result.nextCursor,
      }),
    );
  };

  // ── Open / Cancel Reply Box ─────────────────────────────────────
  const handleOpenReply = (node: EventComment) => {
    setActiveReplyBox(node.id);
  };

  const handleCancelReply = (nodeId: string) => {
    setActiveReplyBox(null);
    setReplyInputs((prev) => ({ ...prev, [nodeId]: "" }));
  };

  // ── Reveal a comment linked from a notification ─────────────────
  // If the target comment is a reply, load its parent's replies first
  // so it actually exists in the tree to scroll to.
  useEffect(() => {
    if (!targetParentId) return;
    const parent = findNode(comments, targetParentId);
    if (parent && !parent.repliesLoaded) {
      const timer = setTimeout(() => handleLoadReplies(targetParentId), 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetParentId]);

  useEffect(() => {
    if (!targetCommentId) return;

    const el = document.getElementById(`comment-${targetCommentId}`);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = setTimeout(() => setHighlightId(null), 3000);
    return () => clearTimeout(timer);
  }, [targetCommentId, comments]);

  const handlers = {
    isEventEnded,
    isOrgMode,
    currentUserId: session?.user?.userId,
    currentOrgId: me?.orgId,
    openMenuId,
    setOpenMenuId,
    editingId,
    setEditingId,
    editInputs,
    setEditInputs,
    deletingId,
    setDeletingId,
    activeReplyBox,
    replyInputs,
    setReplyInputs,
    onOpenReply: handleOpenReply,
    onCancelReply: handleCancelReply,
    onReplySubmit: handleReplySubmit,
    onEditSubmit: handleEditSubmit,
    onLoadReplies: handleLoadReplies,
    me,
    currentUserName,
    highlightId,
  };

  return (
    <div className="w-full p-5 bg-white rounded-[15px] shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold text-(--secondary-color)">
            Comments
          </h3>
          <span className="text-sm font-semibold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full">
            {post.totalComments}
          </span>
        </div>
      </div>

      {/* ── New Comment Input ── */}
      <form
        onSubmit={handleCommentSubmit}
        className="flex gap-3 items-start group border-b pb-5 pt-2 border-slate-100"
      >
        <div className="shrink-0 relative w-10 h-10 rounded-full overflow-hidden bg-slate-50 ring-1 ring-slate-100">
          <Image
            src={
              currentUserAvatar
                ? resolveAvatarUrl(currentUserAvatar)
                : "/images/fallback-pf.png"
            }
            alt={currentUserName}
            className="object-cover"
            width={500}
            height={500}
            onError={(e) => {
              e.currentTarget.src = "/images/fallback-pf.png";
              e.currentTarget.srcset = "";
            }}
          />
        </div>

        <div className="flex w-full min-w-0 flex-row items-start gap-2">
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <div
              className={`relative flex flex-row items-start gap-2 rounded-xl px-4 py-2.5 transition-all duration-200 border ${
                commentError
                  ? "border-(--accent-color) bg-white ring-2 ring-(--accent-color)/20"
                  : "border-transparent bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-(--main-color)/20 focus-within:border-(--main-color)"
              }`}
            >
              <textarea
                rows={1}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (e.target.value.length <= 400) setCommentError(null);
                  if (e.target.value.length > 400)
                    setCommentError("Comment must not exceed 400 characters.");
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (inputValue.trim() && !commentError) {
                      handleCommentSubmit(e as unknown as React.FormEvent);
                    }
                  }
                }}
                placeholder="Share your thoughts..."
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 border-none outline-none focus:ring-0 p-0 resize-none overflow-hidden min-h-6 max-h-40"
              />
            </div>

            {commentError && (
              <p className="ml-1 text-xs text-(--accent-color)">
                {commentError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || !!commentError}
            className="shrink-0 self-start mt-0.5 w-11 h-11 flex items-center justify-center rounded-xl bg-(--main-color) text-white hover:opacity-90 transition-all disabled:opacity-30 cursor-pointer"
          >
            <Send2 size={24} color="#ffff" variant="Linear" />
          </button>
        </div>
      </form>

      {/* ── Comments Tree ── */}
      <div className="flex flex-col gap-4 mt-2">
        {comments.map((node) => (
          <CommentNode
            key={node.id}
            node={node}
            depth={0}
            handlers={handlers}
          />
        ))}
      </div>

      {hasNext && (
        <button
          onClick={handleLoadMore}
          className="w-full text-center text-slate-500 hover:text-slate-800 text-xs font-semibold py-2.5 mt-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-150 cursor-pointer"
        >
          View more comments
        </button>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl flex flex-col items-center p-7 text-center animate-in fade-in slide-in-from-bottom-6 duration-300">
            <button
              onClick={() => setDeletingId(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 className="mt-5 text-xl font-bold text-(--secondary-color)">
              Delete Comment?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#7886a6]">
              This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3 w-full">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(deletingId)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white cursor-pointer transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
