import { MeData, MeResponse } from "@/types/auth.types";
import { serverFetch } from "@/lib/server-fetch";

export async function getMe(): Promise<MeResponse> {
  const res = await serverFetch("users/me");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return await res.json();
}

// Client-side /users/me with an explicit token (used by useCurrentUserProfile).
export async function getCurrentUserProfile(accessToken: string): Promise<MeData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  const json = await res.json();
  return json.data;
}
