"use client";
import React from "react";
import "@/app/globals.css";
import { PostContentComponent } from "@/components/posts/PostContentComponent";
import { UserPostComponent } from "./UserPostComponent";
import { ActivityCommentComponent } from "./CommentComponent";
import { LinkedEventComponent } from "./LikedEventComponent";
import {
  ActivityCommentComponent as ActivityCommentData,
  PostDetail,
} from "@/types/activity.type";
import { MeData } from "@/types/auth.types";

interface PostDetailProps {
  post: PostDetail;
  comment: ActivityCommentData;
  me: MeData | null;
}

export default function ActivityDetails({
  post,
  comment,
  me,
}: PostDetailProps) {
  return (
    <div className="w-full max-w-full mx-auto flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="contents md:flex md:flex-col md:w-[65%] md:min-w-0 md:gap-4">
          <div className="order-2 md:order-0">
            <PostContentComponent post={post} />
          </div>
          <div className="order-4 md:order-0">
            <ActivityCommentComponent comment={comment} post={post} me={me} />
          </div>
        </div>

        <div className="contents md:flex md:flex-col md:w-[35%] md:h-full md:min-w-0 md:gap-4">
          <div className="order-1 md:order-0">
            <UserPostComponent post={post} showBackButton />
          </div>
          {post.likedEvent?.eventId && (
            <div className="order-3 md:order-0">
              <LinkedEventComponent post={post} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
