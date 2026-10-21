"use client";
import React, {useCallback, useState, useTransition} from "react";
import PostForm from "@/components/posts/PostForm";
import Link from "next/link";
import {useAuth} from "@/hooks/useAuth";
import {useRouter} from "next/navigation";
import FallbackProfile from "@public/images/fallback-pf.png";
import {revalidateDiscovery} from "@/actions/feed";
import {resolveUrl} from "@/lib/format";
import Image from "next/image";
import {useQueryClient} from "@tanstack/react-query";

export default function CreatePostInput({ serverAvatar }: { serverAvatar?: string | null }) {
    const {user} = useAuth();
    const router = useRouter();
    const effectiveOrgMode = !!user?.orgId;
    const profileUrl = effectiveOrgMode ? `/profile/${user?.orgId}` : (user?.userId ? `/profile/${user.userId}` : '/profile');
    const [, startTransition] = useTransition();

    const displayAvatar = serverAvatar || (effectiveOrgMode ? user?.logo : user?.avatar);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const handleOpenForm = () => setIsFormOpen(true);
    const handleCloseForm = () => setIsFormOpen(false);

    const queryClient = useQueryClient();

    const handlePostSuccess = useCallback(async () => {
        await revalidateDiscovery();
        await queryClient.invalidateQueries({ queryKey: ["feed"] });
        await queryClient.invalidateQueries({ queryKey: ["gallery"] });
        router.refresh();
        startTransition(() => router.refresh());
    }, [queryClient, router, startTransition]);

    return (
        <>
            <div className="w-full bg-[var(--background-white)] p-2 px-4 rounded-xl card-shadow border border-[var(--input-border)] flex items-center gap-3">
                <Link
                    href={profileUrl}
                    onClick={() => setIsFormOpen(false)}
                    className="relative block w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-[var(--input-border)] bg-[var(--background-gray)] hover:opacity-90 transition-opacity"
                >
                    <Image
                        src={resolveUrl(displayAvatar, FallbackProfile)}
                        alt={user?.email || "User avatar"}
                        className="object-cover"
                        fill
                    />
                </Link>

                <div
                    onClick={handleOpenForm}
                    className="flex-1 h-10 bg-transparent border border-[var(--input-border)] rounded-xl px-4 text-sm font-inter text-[var(--text-secondary)] flex items-center select-none cursor-pointer hover:bg-[var(--background-gray)] transition-all">
                    What&apos;s on your mind?
                </div>

                <button
                    onClick={handleOpenForm}
                    className="bg-main text-[var(--btn-text)] px-3 sm:px-5 h-9 rounded-xl text-sm font-normal hover:opacity-90 shadow-sm cursor-pointer transition-all active:scale-[0.98] flex items-center gap-1 flex-shrink-0">
                    <svg className="w-4 h-4 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span className="hidden sm:inline">Create Post</span>
                </button>
            </div>
            {isFormOpen && (
                <PostForm
                    onClose={handleCloseForm}
                    onPostSuccess={handlePostSuccess}
                />
            )}
        </>
    );
}