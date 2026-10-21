import { blockedInMockMode } from "@/lib/mock-guard";
import { getSession } from "next-auth/react";
import type { Session } from "next-auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";


let pendingSession: Promise<Session | null> | null = null;

function resolveSession(): Promise<Session | null> {
  // On the server side, getSession (client-only) cannot be used.
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }
  if (!pendingSession) {
    pendingSession = getSession().finally(() => {
      setTimeout(() => { pendingSession = null; }, 1500);
    });
  }
  return pendingSession;
}

export async function clientFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const blocked = blockedInMockMode(path);
  if (blocked) return blocked;

  const session = await resolveSession();

  const explicitHeaders = (init.headers as Record<string, string>) || {};
  const hasExplicitAuth = Object.keys(explicitHeaders).some(
    (key) => key.toLowerCase() === "authorization"
  );

  const finalHeaders = {
    ...(init.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(!hasExplicitAuth && session?.user?.accessToken
      ? { Authorization: `Bearer ${session.user.accessToken}` }
      : {}),
    ...init.headers,
  };


  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: finalHeaders,
  });
}
