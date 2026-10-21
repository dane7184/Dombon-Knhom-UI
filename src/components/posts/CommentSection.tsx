"use client";
import React, { useState, useRef } from "react";

import Link from "next/link";
import Image from "next/image";
import { resolveAvatarUrl } from "@/lib/format";
import { useCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
import { useAuth } from "@/hooks/useAuth";
import "@/app/globals.css";

import { Send2 } from "iconsax-react";
import { PostDetail } from "@/types/activity.type";

interface CommentSectionProps {
  post: PostDetail;
}

export const CommentSection = ({ post }: CommentSectionProps) => {
  // Normalize incoming post comment data to a local shape the component expects.
  type LocalReply = {
    id: number;
    replierId: number | string;
    replierName: string;
    replierImage?: string;
    replyContent: string;
    time?: string;
    replyToUserId?: number | string;
    replyToUserName?: string;
  };

  type LocalComment = {
    id: number;
    commenterId: number | string;
    commenterName: string;
    commenterImage?: string;
    commentContent: string;
    time?: string;
    replyComments?: LocalReply[];
  };
  type RawComment = NonNullable<PostDetail["comments"]>[number];
  type RawReply = NonNullable<RawComment["replyComments"]>[number];

  const rawComments: RawComment[] = post.comments ?? [];

  const initialComments: LocalComment[] = rawComments.map((c, i) => ({
    id: i + 1,
    commenterId: c.commenterId,
    commenterName: c.commenterName,
    commenterImage: c.commenterImage,
    commentContent: c.commentContent,
    time: c.time,
    replyComments: (c.replyComments ?? []).map((r: RawReply, j) => ({
      id: i + j + 1,
      replierId: r.replyerId,
      replierName: r.replyerName,
      replierImage: r.replyerImage,
      replyContent: r.replyContent,
      time: r.time,
      replyToUserId: c.commenterId,
      replyToUserName: c.commenterName,
    })),
  }));

  const totalReplies = initialComments.reduce(
    (sum, c) => sum + (c.replyComments?.length || 0),
    0,
  );

  const [commentsList, setCommentsList] = useState(initialComments);
  const [commentsCount, setCommentsCount] = useState(
    initialComments.length + totalReplies,
  );
  const [inputValue, setInputValue] = useState("");
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({});
  const [activeReplyBox, setActiveReplyBox] = useState<number | null>(null);

  // Track who we are explicitly tagging/replying to within a thread
  const [replyTarget, setReplyTarget] = useState<{
    userId: number | string;
    userName: string;
  } | null>(null);
  const replyInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const { data: myProfile } = useCurrentUserProfile();
  const { isOrgMode, user } = useAuth();
  const currentUserProfile =
    (isOrgMode && user?.logo ? user.logo : myProfile?.avatar) ||
    "/images/fallback-pf.png";

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newComment = {
      id: Date.now(),
      commenterId: 999,
      commenterName: "You",
      commenterImage: currentUserProfile,
      commentContent: inputValue,
      time: "Just now",
      replyComments: [],
    };

    setCommentsList([newComment, ...commentsList]);
    setCommentsCount((prev) => prev + 1);
    setInputValue("");
  };

  const initiateReply = (
    commentId: number,
    userId: number | string,
    userName: string,
  ) => {
    if (activeReplyBox === commentId && replyTarget?.userId === userId) {
      // Toggle off if clicking the same exact reply button again
      setActiveReplyBox(null);
      setReplyTarget(null);
    } else {
      setActiveReplyBox(commentId);
      setReplyTarget({ userId, userName });

      // Pre-populate with tag name for visual clarity
      setReplyInputs((prev) => ({
        ...prev,
        [commentId]: prev[commentId] ? prev[commentId] : `@${userName} `,
      }));

      // Focus input field instantly
      setTimeout(() => {
        replyInputRefs.current[commentId]?.focus();
      }, 50);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, commentId: number) => {
    e.preventDefault();
    const replyText = replyInputs[commentId];
    if (!replyText || !replyText.trim()) return;

    const parentComment = commentsList.find((c) => c.id === commentId);
    if (!parentComment || !replyTarget) return;

    // Clean up content text if they typed right after the pre-filled tag string
    const tagPrefix = `@${replyTarget.userName} `;
    const finalContent = replyText.startsWith(tagPrefix)
      ? replyText.slice(tagPrefix.length)
      : replyText;

    const newReply = {
      id: Date.now(),
      replierId: 999,
      replierName: "You",
      replierImage: currentUserProfile,
      replyContent: finalContent,
      time: "Just now",
      replyToUserId: replyTarget.userId,
      replyToUserName: replyTarget.userName,
    };

    setCommentsList(
      commentsList.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replyComments: [...(c.replyComments || []), newReply],
          };
        }
        return c;
      }),
    );

    setCommentsCount((prev) => prev + 1);
    setReplyInputs({ ...replyInputs, [commentId]: "" });
    setActiveReplyBox(null);
    setReplyTarget(null);
  };

  return (
    <div className="w-full p-3 bg-white rounded-[12px] shadow-sm flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold text-slate-900">Comments</h3>
        <p className="text-sm px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-[10px] font-medium">
          {commentsCount}
        </p>
      </div>

      <form
        onSubmit={handleCommentSubmit}
        className="flex items-center gap-3 border-b border-slate-200 pb-2"
      >
        <Link
          href="/profile"
          className="shrink-0 relative w-9 h-9 rounded-full overflow-hidden bg-slate-100"
        >
          <Image
            src={resolveAvatarUrl(currentUserProfile)}
            alt="Current User"
            fill
            className="object-cover"
          />
        </Link>
        <div className="flex flex-1 items-center justify-between gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Write a comment..."
            className="w-full py-1.5 text-sm text-slate-700 placeholder-slate-400 border-0 focus:outline-none focus:ring-0"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-400 text-white hover:bg-blue-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send2 size={18} color="#fff" />
          </button>
        </div>
      </form>

      <div className="divide-y divide-slate-50">
        {commentsList.map((comment) => (
          <div key={comment.id} className="flex flex-col gap-3 py-3 first:pt-0">
            {/* Parent Comment */}
            <div className="flex items-start gap-3">
              <Link
                href={`/profile/${comment.commenterId}`}
                className="shrink-0 relative w-9 h-9 rounded-full overflow-hidden bg-slate-100"
              >
                <Image
                  src={resolveAvatarUrl(comment.commenterImage)}
                  alt={comment.commenterName}
                  fill
                  className="object-cover"
                />
              </Link>
              <div className="flex flex-col items-start max-w-[85%]">
                <Link
                  href={`/profile/${comment.commenterId}`}
                  className="font-semibold text-sm text-slate-900 mb-1 hover:underline"
                >
                  {comment.commenterName}
                </Link>
                <div className="bg-slate-50 p-2.5 rounded-[10px]">
                  <p className="text-sm text-slate-600 whitespace-pre-wrap wrap-break-words">
                    {comment.commentContent}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-1.5 ml-1 text-xs text-slate-400">
                  <span>{comment.time}</span>
                  <button
                    onClick={() =>
                      initiateReply(
                        comment.id,
                        comment.commenterId,
                        comment.commenterName,
                      )
                    }
                    className="font-medium hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>

            {/* Nested Inner Replies */}
            {comment.replyComments && comment.replyComments.length > 0 && (
              <div className="flex flex-col gap-3 mt-1 border-l-2 border-slate-100 ml-5 pl-6">
                {comment.replyComments.map((reply) => (
                  <div key={reply.id} className="flex items-start gap-3">
                    <Link
                      href={`/profile/${reply.replierId}`}
                      className="shrink-0 relative w-7 h-7 rounded-full overflow-hidden bg-slate-100"
                    >
                      <Image
                        src={resolveAvatarUrl(reply.replierImage)}
                        alt={reply.replierName}
                        fill
                        className="object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0 max-w-[90%]">
                      <Link
                        href={`/profile/${reply.replierId}`}
                        className="font-semibold text-xs text-slate-800 block mb-1 hover:underline"
                      >
                        {reply.replierName}
                      </Link>
                      <div className="bg-slate-50 p-2.5 rounded-[10px] inline-block">
                        <p className="text-sm text-slate-600 whitespace-pre-wrap wrap-break-words">
                          <span className="text-blue-500 font-medium mr-1">
                            @{reply.replyToUserName}
                          </span>
                          {reply.replyContent}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 ml-1 text-xs text-slate-400">
                        <span>{reply.time}</span>
                        <button
                          onClick={() =>
                            initiateReply(
                              comment.id,
                              reply.replierId,
                              reply.replierName,
                            )
                          }
                          className="font-medium hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Shared Context Thread Input Row */}
            {activeReplyBox === comment.id && (
              <form
                onSubmit={(e) => handleReplySubmit(e, comment.id)}
                className="flex items-center gap-3 ml-12 mt-1 pb-1 border-b border-slate-100 animate-fadeIn"
              >
                <div className="shrink-0 relative w-7 h-7 rounded-full overflow-hidden bg-slate-100">
                  <Image
                    src={resolveAvatarUrl(currentUserProfile)}
                    alt="Current User"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 items-center justify-between gap-3">
                  <input
                    type="text"
                    ref={(el) => {
                      replyInputRefs.current[comment.id] = el;
                    }}
                    value={replyInputs[comment.id] || ""}
                    onChange={(e) =>
                      setReplyInputs({
                        ...replyInputs,
                        [comment.id]: e.target.value,
                      })
                    }
                    placeholder={`Reply to ${replyTarget?.userName}...`}
                    className="w-full py-1 text-xs text-slate-700 placeholder-slate-400 border-0 focus:outline-none focus:ring-0 bg-transparent"
                  />
                  <button
                    type="submit"
                    disabled={
                      !replyInputs[comment.id]?.trim() ||
                      replyInputs[comment.id] === `@${replyTarget?.userName} `
                    }
                    className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1"
                  >
                    Post
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>

      {/* {commentsCount > 0 && (
        <p className="text-center text-slate-400 hover:text-slate-600 text-xs font-medium pt-2 cursor-pointer transition-colors">
          View all {commentsCount} comments
        </p>
      )} */}
    </div>
  );
};
