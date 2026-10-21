// store/useEventStore.ts
import { create } from "zustand";

interface EventState {
  // Like
  isLiked: boolean;
  totalLikes: number;
  toggleLike: () => void;

  // Comments
  totalComments: number;
  addComment: () => void;
  addReply: () => void;

  // Init — call once on mount with server data
  init: (data: {
    isLiked: boolean;
    totalLikes: number;
    totalComments: number;
  }) => void;
}

export const useEventStore = create<EventState>((set) => ({
  isLiked: false,
  totalLikes: 0,
  totalComments: 0,

  init: (data) =>
    set({
      isLiked: data.isLiked,
      totalLikes: data.totalLikes,
      totalComments: data.totalComments,
    }),

  toggleLike: () =>
    set((state) => ({
      isLiked: !state.isLiked,
      totalLikes: state.isLiked ? state.totalLikes - 1 : state.totalLikes + 1,
    })),

  // Each new comment or reply increments the count
  addComment: () =>
    set((state) => ({ totalComments: state.totalComments + 1 })),
  addReply: () => set((state) => ({ totalComments: state.totalComments + 1 })),
}));
