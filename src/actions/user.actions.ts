"use server";

import { searchUsersService } from "@/services/searchName.service";

export interface SearchUser {
    id: string | number;
    fullName: string;
    image?: string;
    role: string;
    isOrganizer: boolean;
    bio?: string;
    isCurrentUser?: boolean;
    badges?: { name: string }[];
}

export async function searchUsersAction(
    name: string,
    size: number = 10
): Promise<{ success: boolean; data: SearchUser[]; error?: string }> {
    const q = name.trim();
    if (!q) return { success: true, data: [] };

    try {
        const raw = await searchUsersService(q, size);

        // Map the API shape → the shape the UI expects.
        // Adjust the right-hand fields (u.name, u.isOrg, u.userId, u.avatar)
        // to match your real /users response.
        const data: SearchUser[] = raw.map((u: any) => ({
            id: u.userId ?? u.id,
            fullName: u.fullName ?? u.name ?? u.displayName ?? u.username ?? "",
            image: u.image ?? u.avatar ?? undefined,
            role: u.role ?? "",
            isOrganizer: Boolean(u.isOrg ?? u.isOrganizer),
            bio: u.bio ?? undefined,
            isCurrentUser: Boolean(u.isCurrentUser),
            badges: u.badges ?? undefined,
        }));

        return { success: true, data };
    } catch (err) {
        console.error("[searchUsersAction] failed:", err);
        return {
            success: false,
            data: [],
            error: err instanceof Error ? err.message : "Search failed",
        };
    }
}