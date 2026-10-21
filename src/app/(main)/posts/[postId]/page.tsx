import React from "react";
import "@/app/globals.css";
import { notFound } from "next/navigation";
import {
  getActivityDetail,
  mapActivityDetailToPostDetail,
} from "@/services/activity.service";
import { getActivityComments } from "@/services/activity.service";
import { getMe } from "@/services/auth.service";
import { getProfile, getOrgProfile } from "@/services/profileInfo.service";
import { auth } from "@/lib/auth";
import PostDetail from "@/components/posts/PostDetail";
import { Metadata } from "next";
import { FRONTEND_URL } from "@/lib/url";
import { resolveUrl } from "@/lib/format";

// Detail shows per-user like/save state and needs the request's session,
// so render on demand instead of statically prerendering at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}): Promise<Metadata> {
  const { postId } = await params;

  let raw = null;
  try {
    raw = await getActivityDetail(postId);
  } catch {
    // API returned an error (e.g. 401 without auth) — fall back to defaults
  }

  if (!raw) {
    return {
      title: "Post | Dombon Khnom",
      description: "Check out this post on Dombon Khnom.",
    };
  }

  const firstImage = raw.media?.find((m) => m.type?.toLowerCase() === "image");
  const imageUrl = resolveUrl(firstImage?.fileUrl ?? null);

  const title = raw.ownerName
    ? `${raw.ownerName}'s post | Dombon Khnom`
    : "Post | Dombon Khnom";
  const description = raw.content || "Check out this post on Dombon Khnom.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${FRONTEND_URL}/posts/${postId}`,
      siteName: "Dombon Khnom",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

type PostDetailProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function page({ params }: PostDetailProps) {
  const { postId } = await params;
  const activity = await getActivityDetail(postId);

  if (!activity) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-10 bg-red-100 text-red-800 wrap-break-words">
        <h1 className="text-3xl font-bold mb-4">Debug: Activity is NULL</h1>
        <p>Post ID: {postId}</p>
        <p>If you see this, the API returned 404 or null data.</p>
      </div>
    );
  }

  const post = mapActivityDetailToPostDetail(activity, postId);

  // ── Get current user profile (for comment avatar/name) ──────
  const session = await auth();
  let me = null;
  if (session) {
    const res = await getMe();
    me = res.data ?? null;

    // Fetch real isFavorite status of the poster
    if (post.postUser.posterId) {
      try {
        if (post.postUser.isOrganizer) {
          const orgProf = await getOrgProfile(post.postUser.posterId);
          post.postUser.isFavorite = orgProf.data?.isFavorite ?? false;
        } else {
          const usrProf = await getProfile(post.postUser.posterId);
          post.postUser.isFavorite = usrProf.data?.isFavorite ?? false;
        }
      } catch (e) {
        // Ignore fetch errors
      }
    }
  }

  // ── Fetch first page of top-level comments ───────────────────
  const comment = await getActivityComments(postId);

  return (
    <>
      <div className="px-4 md:px-[15%] mx-auto pt-28 pb-26 md:pb-4">
        <PostDetail post={post} comment={comment} me={me} />
      </div>
    </>
  );
}
