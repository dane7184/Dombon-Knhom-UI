"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { toggleActivityReactionWithCookie } from "@/services/activity.service";

// Helper to get the auth token
async function getAuthToken() {
    const cookieStore = await cookies();
    return cookieStore.get("accessToken")?.value; // Or whatever your cookie name is
}

export async function toggleLikeAction(activityId: string) {
    const ok = await toggleActivityReactionWithCookie(activityId, "like", await getAuthToken());

    if (ok) {
        revalidatePath("/discovery");
    }
}

export async function toggleSaveAction(activityId: string) {
    // Ensure this uses POST and includes the Auth headers
    const ok = await toggleActivityReactionWithCookie(activityId, "saved", await getAuthToken());

    if (ok) {
        revalidatePath("/discovery");
    }
}
