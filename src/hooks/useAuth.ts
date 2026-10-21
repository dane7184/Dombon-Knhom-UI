"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user ?? null;
  const role = user?.role ?? null;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const isOrgMode = !!user?.orgId;

  return {
    user,
    role,
    isLoading,
    isAuthenticated,
    isOrgMode,

    // Org context
    orgId: user?.orgId ?? null,
    orgName: user?.orgName ?? null,
    logo: user?.logo ?? null,

    // Tokens and IDs
    accessToken: user?.accessToken ?? null,
    userId: user?.userId ?? null,

    // Role guards
    isUser: role === "User",
    isOrganizer: role === "Organizer",
    isModerator: role === "Moderator",
    isAdmin: role === "Admin",

    // Permission guards
    canManageOrg: role === "Organizer" || role === "Admin",
    canModerate: role === "Moderator" || role === "Admin",
    canAccessMain: role === "User" || role === "Organizer",

    // Organizer in user mode (has role but no active org context)
    isOrganizerInUserMode: role === "Organizer" && !isOrgMode,
  };
}
