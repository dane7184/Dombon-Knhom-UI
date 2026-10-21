import { ModOrgCreationResponse, OrgRequestDetailResponse } from "@/types/moderator.type";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function authHeaders(token?: string) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function toItem(raw: unknown): Record<string, unknown> {
  return (raw ?? {}) as Record<string, unknown>;
}

export async function getOrganizerRequests(token?: string): Promise<ModOrgCreationResponse[]> {
  try {
    const res = await fetch(`${BASE_URL}moderator/organizers`, {
      method: "GET",
      headers: authHeaders(token),
    });
    const json = await res.json();
    const items: unknown[] = json?.data?.content ?? json?.data ?? json?.content ?? [];
    if (!Array.isArray(items)) return [];
    return items.map((raw) => {
      const item = toItem(raw);
      return {
        orgId: String(item.orgId ?? ""),
        orgName: String(item.orgName ?? ""),
        phone: String(item.phone ?? item.phoneNumber ?? ""),
        requestBy: String(item.requestBy ?? item.submittedBy ?? ""),
        createdAt: String(item.createdAt ?? item.requestedDate ?? ""),
        status: (item.status ?? "Pending") as ModOrgCreationResponse["status"],
      };
    });
  } catch {
    return [];
  }
}

export async function getOrgRequestDetail(orgId: string, token?: string): Promise<OrgRequestDetailResponse | null> {
  try {
    const res = await fetch(`${BASE_URL}moderator/organizers/${orgId}`, {
      method: "GET",
      headers: authHeaders(token),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function patchOrganizerStatus(
  orgId: string,
  status: "Approved" | "Rejected",
  reason?: string,
  token?: string,
): Promise<boolean> {
  try {
    const body =
      status === "Approved"
        ? { action: "Approved" }
        : { action: "Rejected", reason };
    const res = await fetch(`${BASE_URL}moderator/organizers/${orgId}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}