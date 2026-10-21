// Mock implementation of services/api/favorite.service.ts.

import type { FavoritesResponse } from "@/types/favorite.type";
import { favoritesOf } from "@/mocks/favorites.mock";
import { apiRes, mockRequest } from "@/mocks/utils";

function response(actorId: string): FavoritesResponse {
  // The real endpoint is cursor-paginated; the mock returns everything in one page.
  return {
    ...apiRes({ content: favoritesOf(actorId), nextCursor: null, hasNext: false }),
    message: "Favorites fetched successfully",
  };
}

export const getFavorites = async (userId: string): Promise<FavoritesResponse> => {
  await mockRequest("favorite.list");
  return response(userId);
};

export const getOrgFavorites = async (orgId: string): Promise<FavoritesResponse> => {
  await mockRequest("favorite.list");
  return response(orgId);
};
