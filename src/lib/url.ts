// lib/url.ts
export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3000";

export function eventUrl(eventId: string) {
  return `${FRONTEND_URL}/events/${eventId}`;
}

export function postUrl(postId: string) {
  return `${FRONTEND_URL}/posts/${postId}`;
}
