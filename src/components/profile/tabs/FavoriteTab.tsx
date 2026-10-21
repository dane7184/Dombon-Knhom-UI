import React from "react";
import FavoriteList from "../FavoriteList";
import { getFavoriteUser, getOrgFavoriteUser } from "@/services/profileInfo.service";
import { FavoriteUserlist } from "@/types/user.type";

export default async function FavoriteTab({ userId, isOrgProfile }: { userId: string; isOrgProfile?: boolean }) {
    let list: FavoriteUserlist[] = [];
    let error = false;

    try {
        if (isOrgProfile) {
            const res = await getOrgFavoriteUser(userId);
            list = res.data?.content ?? [];
        } else {
            const res = await getFavoriteUser(userId);
            list = res.data?.content ?? [];
        }
    } catch (err) {
        console.error("FavoriteTab error:", err);
        error = true;
    }

    if (error) {
        return <div className="text-desc text-lg">Failed to load favorites. Please try again later.</div>;
    }

    const dedupedList = list.filter(
        (item, index, self) => index === self.findIndex((t) => t.entityId === item.entityId)
    );
    
    return (
        <div className="pb-5">
            <FavoriteList initialList={dedupedList} />
        </div>
    );
}