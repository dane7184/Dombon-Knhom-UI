"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { fetchActivityFeed, FeedPage, getGalleryPage } from "@/services/activity.service";
import { GalleryData } from "@/types/activity.type";

export async function revalidateDiscovery() {
    revalidatePath("/discovery");
    revalidatePath("/");
    revalidatePath("/profile/[id]", "page");
    revalidatePath("/profile", "page");
}

export async function loadMoreFeed(cursor: string): Promise<FeedPage> {
    const session = await auth();
    const userId = session?.user?.userId;
    const orgId = session?.user?.orgId;
    const accessToken = session?.user?.accessToken;

    if (!userId || !accessToken) {
        return { activities: [], nextCursor: null, hasNext: false };
    }

    return fetchActivityFeed(cursor, accessToken, userId, orgId);
}

export async function getGalleryAction(cursor?: string | null): Promise<GalleryData> {
    return getGalleryPage(cursor);
}
