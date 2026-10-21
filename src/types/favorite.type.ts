export interface FavoriteOrganization {
    organizationId: string
    name: string
    profile: string
    location: string
}
export interface FavoriteUser {
    userId: string
    name: string
    profile: string
}
export interface FavoriteItem {
    entityId: string;
    entityType: "User" | "Organization";
    name: string;
    username?: string;
    email?: string;
    image: string | null;
    favoriteCount: number;
    createdAt: string;
    bookmarkId: string;
}
export interface FavoritesResponse {
    success: boolean;
    message: string;
    data: {
        content: FavoriteItem[];
        nextCursor: string | null;
        hasNext: boolean;
    };
    timestamp: string;
}