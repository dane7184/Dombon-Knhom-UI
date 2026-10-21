// Resolves "who is calling" for mock services that need the current viewer
// (e.g. /users/me, ownership checks). Works on both server and client,
// mirroring how server-fetch / client-fetch read the next-auth session.

import type { Role } from "@/types/common.type";
import { readMockToken } from "@/mocks/auth.mock";

export interface MockViewer {
  userId: string | null;
  orgId: string | null;
  role: Role | null;
}

export async function getMockViewer(): Promise<MockViewer | null> {
  try {
    // Imported lazily: lib/auth itself imports the auth service, which would
    // otherwise create a circular import through the mock auth service.
    const session =
      typeof window === "undefined"
        ? await (await import("@/lib/auth")).auth()
        : await (await import("next-auth/react")).getSession();

    if (!session?.user) return null;

    // The token is the source of truth for org mode right after a switch,
    // before the session cookie has been re-read everywhere.
    const claims = readMockToken(session.user.accessToken);
    return {
      userId: session.user.userId ?? claims?.sub ?? null,
      orgId: session.user.orgId ?? claims?.orgId ?? null,
      role: session.user.role ?? null,
    };
  } catch {
    return null;
  }
}
