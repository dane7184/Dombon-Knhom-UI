import {serverFetch} from "@/lib/server-fetch";
import {SearchUser} from "@/types/user.type";

const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export async function getMeByName(
    userToken: string,
    name: string,
    size: number = 10
): Promise<SearchUser[]> {
    if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");

    const params = new URLSearchParams({ name, size: String(size) });

    const response = await fetch(`${baseUrl}/users?${params.toString()}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${userToken}`
        },
        cache: "no-cache",
    });

    if (!response.ok) {
        throw new Error("Search user failed.");
    }

    const json = await response.json();
    // adjust to your real shape: array, json.data, or json.data.content
    return Array.isArray(json.data) ? json.data : json.data?.content ?? [];
}
/** Raw item of GET /api/v1/users (see api_endpoint.json "searchByName"). */
export interface ApiSearchUser {
    id: string;
    name: string;
    image: string | null;
    role: string;
    isOrg: boolean;
    createdAt: string;
}

/**
 * GET /api/v1/users?name=&size= — server-side search used by searchUsersAction.
 * Throws with the backend status and body text when the request fails.
 */
export async function searchUsersService(
    name: string,
    size: number = 10
): Promise<ApiSearchUser[]> {
    const params = new URLSearchParams({ name, size: String(size) });
    const res = await serverFetch(`users?${params.toString()}`);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Search failed [${res.status}]: ${text}`);
    }

    const json = await res.json();
    return Array.isArray(json.data) ? json.data : json.data?.content ?? [];
}
