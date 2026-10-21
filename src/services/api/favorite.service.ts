import { serverFetch } from "@/lib/server-fetch";
import { FavoritesResponse } from "@/types/favorite.type";

export const getFavorites = async (userId: string): Promise<FavoritesResponse> => {
    const res = await serverFetch(`users/${userId}/favorite`, {
        method: "GET",
        next: { revalidate: 0 },
    });

    if (!res.ok) {
        console.error(`[Backend Error] Status: ${res.status} for User: ${userId}`);
        throw new Error(`Backend returned status ${res.status}`);
    }

    return res.json();
};

export const getOrgFavorites = async (orgId: string): Promise<FavoritesResponse> => {
    const res = await serverFetch(`organizations/${orgId}/favorites`, {
        method: "GET",
        next: { revalidate: 0 },
    });

    if (!res.ok) {
        console.error(`[Backend Error] Status: ${res.status} for Org: ${orgId}`);
        throw new Error(`Backend returned status ${res.status}`);
    }

    return res.json();
};
