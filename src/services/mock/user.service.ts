// Mock implementation of services/api/user.service.ts. /users/me is the same
// call as the auth service's getMe, so both functions delegate there.

import type { MeData } from "@/types/auth.types";
import { getMe } from "@/services/mock/auth.service";

export { getMe };

export async function getCurrentUserProfile(): Promise<MeData> {
  const res = await getMe();
  return res.data;
}
