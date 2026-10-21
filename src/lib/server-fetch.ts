import { auth } from "@/lib/auth";
import { blockedInMockMode } from "@/lib/mock-guard";

const BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function serverFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const blocked = blockedInMockMode(path);
  if (blocked) return blocked;

  const explicitHeaders = (init.headers as Record<string, string>) || {};
  const hasExplicitAuth = Object.keys(explicitHeaders).some(
    (key) => key.toLowerCase() === "authorization"
  );

  let accessToken: string | undefined;

  if (!hasExplicitAuth) {
    const session = await auth();
    accessToken = session?.user?.accessToken;
  }

  const finalHeaders = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...init.headers,
  };

  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: finalHeaders,
  });
}
