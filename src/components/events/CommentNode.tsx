"use client";

import React from "react";
import Link from "next/link";
import { MoreHorizontal, X } from "lucide-react";
import { EventComment } from "@/types/event.type";
import { resolveAvatarUrl } from "@/lib/format";
import Image from "next/image";
import { Send2 } from "iconsax-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ── Mention parsing ─────────────────────────────────────────────
// content format: @{userId|userName} message text  (or plain text with no mention)
const MENTION_REGEX = /^@\{([^|]+)\|([^}]+)\}\s*(.*)$/;

interface ParsedMention {
  userId: string;
  userName: string;
  text: string;
}

export function parseMention(content: string): ParsedMention | null {
  const match = content.match(MENTION_REGEX);
  if (!match) return null;
  const [, userId, userName, text] = match;
  return { userId, userName, text };
}

export function getEditableContent(content: string): string {
  const parsed = parseMention(content);
  return parsed ? parsed.text : content;
}

export function renderCommentContent(content: string) {
  const parsed = parseMention(content);

  if (parsed) {
    return (
      <p className="text-sm text-slate-600 whitespace-pre-wrap break-all">
        <Link
          href={`/profile/${parsed.userId}`}
          className="text-blue-500 font-medium hover:underline mr-1"
        >
          @{parsed.userName}
        </Link>
        {parsed.text}
      </p>
    );
  }

  return (
    <p className="text-sm text-slate-600 whitespace-pre-wrap break-all">
      {content}
    </p>
  );
}

// ── Props ────────────────────────────────────────────────────────

export interface CommentNodeHandlers {
  isEventEnded: boolean;
  isOrgMode: boolean;
  currentUserId?: string;
  currentOrgId?: string | null;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editInputs: Record<string, string>;
  setEditInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  deletingId: string | null;
  setDeletingId: (id: string | null) => void;
  activeReplyBox: string | null;
  replyInputs: Record<string, string>;
  setReplyInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onOpenReply: (node: EventComment) => void;
  onCancelReply: (nodeId: string) => void;
  onReplySubmit: (e: React.FormEvent, parentId: string) => void;
  onEditSubmit: (e: React.FormEvent, id: string) => void;
  onLoadReplies: (nodeId: string) => void;
  me: { avatar?: string | null } | null;
  currentUserName: string;
  highlightId?: string | null;
}

interface CommentNodeProps {
  node: EventComment;
  depth: number;
  handlers: CommentNodeHandlers;
}

const MAX_VISUAL_DEPTH = 2;

export const CommentNode = ({ node, depth, handlers }: CommentNodeProps) => {
  const {
    isEventEnded,
    isOrgMode,
    currentUserId,
    currentOrgId,
    editingId,
    setEditingId,
    editInputs,
    setEditInputs,
    setDeletingId,
    activeReplyBox,
    replyInputs,
    setReplyInputs,
    onOpenReply,
    onCancelReply,
    onReplySubmit,
    onEditSubmit,
    onLoadReplies,
    me,
    currentUserName,
    highlightId,
  } = handlers;

  const isTemp = node.id.startsWith("temp-");
  const isHighlighted = highlightId === node.id;
  // Ownership is mode-aware: when acting as the organization you only own the
  // org's comments, and when acting personally you only own your own — so
  // switching modes doesn't expose edit/delete on the other identity's comments.
  const isOwner = isOrgMode
    ? Boolean(node.orgId && currentOrgId && node.orgId === currentOrgId)
    : Boolean(node.userId && node.userId === currentUserId);
  const isEditing = editingId === node.id;
  const isTopLevel = depth === 0;

  // Cap visual indentation at MAX_VISUAL_DEPTH — deeper levels render at the same indent
  const visualDepth = Math.min(depth, MAX_VISUAL_DEPTH);
  const indentClass =
    visualDepth === 0
      ? ""
      : visualDepth === 1
        ? "ml-6 sm:ml-10"
        : "ml-6 sm:ml-10";

  const avatarSize = isTopLevel ? "w-10 h-10" : "w-7 h-7";

  return (
    <div
      id={`comment-${node.id}`}
      className={`flex flex-col gap-2 rounded-xl transition-colors duration-700 ${indentClass} ${visualDepth > 0 ? "border-l-2 border-(--input-border) rounded-bl-lg pl-4 mt-1" : ""} ${isHighlighted ? "bg-(--main-color)/10 ring-2 ring-(--main-color)/30 p-2 -m-2" : ""}`}
    >
      <div className="flex items-start gap-3">
        <Link
          href={`/profile/${node.author.id}`}
          className={`shrink-0 relative ${avatarSize} rounded-full overflow-hidden bg-slate-50 ring-1 ring-slate-100 hover:opacity-90 transition-opacity`}
        >
          <Image
            src={resolveAvatarUrl(node.author.avatarUrl)}
            alt={node.author.name}
            className="object-cover"
            width={500}
            height={500}
          />
        </Link>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-baseline gap-2 mb-0.5">
            <Link
              href={`/profile/${node.author.id}`}
              className={`font-semibold ${isTopLevel ? "text-sm" : "text-xs"} text-slate-900 hover:underline tracking-tight`}
            >
              {node.author.name}
            </Link>
            {node.author.isOrganizer && (
              <span className="text-[10px] font-extrabold tracking-wide uppercase bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                Organizer
              </span>
            )}
            {node.isEdited && (
              <span className="text-[10px] text-slate-400">(edited)</span>
            )}
            <span
              className={`${isTopLevel ? "text-xs" : "text-[11px]"} text-slate-400 font-light ml-auto`}
            >
              {node.postedAt}
            </span>
          </div>

          {/* Inline edit or content */}
          {isEditing ? (
            <form
              onSubmit={(e) => onEditSubmit(e, node.id)}
              className="flex items-center gap-2 mt-1"
            >
              <input
                type="text"
                value={editInputs[node.id] ?? getEditableContent(node.content)}
                onChange={(e) =>
                  setEditInputs((prev) => ({
                    ...prev,
                    [node.id]: e.target.value,
                  }))
                }
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-(--main-color)"
                autoFocus
              />
              <button
                type="submit"
                className="text-xs font-semibold text-blue-500 hover:text-blue-600 cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="mt-0.5 break-all">
              {renderCommentContent(node.content)}
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center gap-3 mt-2">
            {!isTemp && !isEventEnded && (
              <button
                onClick={() => onOpenReply(node)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
              >
                Reply
              </button>
            )}

            {/* Owner ... menu — Edit + Delete, hidden once event ended.
                Portaled Radix dropdown with z above the mobile bottom bar
                (z-1000) so it pops over it instead of hiding behind. */}
            {!isTemp && isOwner && !isEventEnded && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 outline-none focus:outline-none focus-visible:outline-none">
                    <MoreHorizontal size={isTopLevel ? 16 : 14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-28 z-1001!">
                  <DropdownMenuItem
                    className="cursor-pointer text-xs text-slate-700"
                    onSelect={() => {
                      setEditingId(node.id);
                      setEditInputs((prev) => ({
                        ...prev,
                        [node.id]: getEditableContent(node.content),
                      }));
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer text-xs"
                    onSelect={() => setDeletingId(node.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Reply input box */}
          {!isEventEnded && activeReplyBox === node.id && (
            <form
              onSubmit={(e) => onReplySubmit(e, node.id)}
              className="flex items-start gap-2 mt-2"
            >
              {/* Avatar — stays at top */}
              <div className="shrink-0 relative w-7 h-7 rounded-full overflow-hidden bg-slate-50 mt-1">
                <Image
                  src={resolveAvatarUrl(me?.avatar)}
                  alt={currentUserName}
                  className="object-cover"
                  width={500}
                  height={500}
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div
                  className={`flex items-start gap-1.5 rounded-xl pl-3 pr-2 py-2 transition-all duration-200 border ${
                    (replyInputs[node.id]?.length ?? 0) > 400
                      ? "border-(--accent-color) bg-white ring-2 ring-(--accent-color)/20"
                      : "bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-(--main-color)/20 focus-within:border-(--main-color) border-transparent"
                  }`}
                >
                  <span className="text-xs font-semibold text-blue-500 select-none shrink-0 pt-0.5">
                    @{node.author.name}
                  </span>
                  <textarea
                    rows={1}
                    value={replyInputs[node.id] || ""}
                    onChange={(e) => {
                      setReplyInputs((prev) => ({
                        ...prev,
                        [node.id]: e.target.value,
                      }));
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (
                          replyInputs[node.id]?.trim() &&
                          (replyInputs[node.id]?.length ?? 0) <= 400
                        ) {
                          onReplySubmit(
                            e as unknown as React.FormEvent,
                            node.id,
                          );
                        }
                      }
                    }}
                    placeholder="Write a reply..."
                    className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 border-none outline-none focus:ring-0 p-0 resize-none overflow-hidden min-h-[20px] max-h-32"
                    autoFocus
                  />
                </div>

                {(replyInputs[node.id]?.length ?? 0) > 400 && (
                  <p className="ml-1 text-xs text-(--accent-color)">
                    Reply must not exceed 400 characters.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  !replyInputs[node.id]?.trim() ||
                  (replyInputs[node.id]?.length ?? 0) > 400
                }
                className="shrink-0 self-start mt-1 w-8 h-8 flex items-center justify-center rounded-lg bg-(--main-color) text-white hover:opacity-90 transition-all disabled:opacity-30 cursor-pointer"
              >
                <Send2 size={18} color="#ffff" variant="Linear" />
              </button>

              <button
                type="button"
                onClick={() => onCancelReply(node.id)}
                className="shrink-0 self-start mt-1 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer transition-all"
              >
                <X size={18} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Children — recursive, depth capped visually but unlimited in data */}
      {node.replies.map((child) => (
        <CommentNode
          key={child.id}
          node={child}
          depth={depth + 1}
          handlers={handlers}
        />
      ))}

      {/* View replies / Load more replies */}
      {node.hasReply &&
        (!node.repliesLoaded ||
          (node.repliesLoaded && node.hasMoreReplies)) && (
          <div className={visualDepth > 0 ? "" : "ml-13"}>
            <button
              onClick={() => onLoadReplies(node.id)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer transition-colors mt-1"
            >
              <span className="w-6 h-px bg-slate-300 inline-block"></span>
              {node.repliesLoaded && node.hasMoreReplies
                ? "View more replies"
                : "View replies"}
            </button>
          </div>
        )}
    </div>
  );
};
