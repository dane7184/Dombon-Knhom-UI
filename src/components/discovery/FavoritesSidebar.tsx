import React from "react";
import { getFavorites, getOrgFavorites } from "@/services/favorite.service";
import FavoritesListClient from "./FavoritesListClient";
import { FavoriteItem } from "@/types/favorite.type";

type FavoritesSidebarProps = {
    userId: string;
    orgId?: string | null;
};

export default async function FavoritesSidebar({
    userId,
    orgId,
}: FavoritesSidebarProps) {
    let favorites: FavoriteItem[] = [];

    try {
        if (orgId) {
            const res = await getOrgFavorites(orgId);
            if (res.success && res.data?.content) {
                favorites = res.data.content;
            }
        } else if (userId) {
            const res = await getFavorites(userId);
            if (res.success && res.data?.content) {
                favorites = res.data.content;
            }
        }
    } catch (error) {
        console.error("Error loading favorites on server:", error);
    }

    return <FavoritesListClient favorites={favorites} />;
}