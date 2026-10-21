"use client";

import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {useState} from "react";
import {switchToOrgAction, switchToUserAction} from "@/actions/auth.actions";

export function useSwitchMode() {
  const { update } = useSession();
  const router = useRouter();
  const [isSwitching, setIsSwitching] = useState(false);

  const switchToOrg = async (orgId: string, redirectPath?: string) => {
    setIsSwitching(true);
    try {
      const result = await switchToOrgAction(orgId);
      if (!result.success) throw new Error(result.error);

      await update({
        user: {
          accessToken: result.data.token,
          refreshToken: result.data.refreshToken,
          orgId: result.data.orgId,
          orgName: result.data.orgName,
          logo: result.data.logo ?? null,
        },
      });

      router.push(redirectPath || "/organizer");
      router.refresh();
    } catch (err) {
      console.error("[switchToOrg] Failed:", err);
    } finally {
      setIsSwitching(false);
    }
  };

  const switchToUser = async () => {
    setIsSwitching(true);
    try {
      const result = await switchToUserAction();
      if (!result.success) throw new Error(result.error);

      await update({
        user: {
          accessToken: result.data.token,
          refreshToken: result.data.refreshToken,
          orgId: null,
          orgName: null,
          logo: null,
        },
      });

      router.push("/home");
      router.refresh();
    } catch (err) {
      console.error("[switchToUser] Failed:", err);
    } finally {
      setIsSwitching(false);
    }
  };

  return { switchToOrg, switchToUser, isSwitching };
}