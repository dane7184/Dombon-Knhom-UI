import React from "react";
import "@/app/globals.css";
import { ProfileInfomation } from "@/components/profile/ProfileInfomation";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { auth } from "@/lib/auth";
import { getProfile } from "@/services/profileInfo.service";
import { notFound } from "next/navigation";


interface PageProps {
  searchParams?: Promise<{
    id?: string;
    tab?: string;
  }>;
}

export default async function page({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const { id, tab } = resolvedSearchParams;

  const session = await auth();
  const profileId = id ?? session?.user?.userId;

  if (!profileId) notFound();

  const profileResponse = await getProfile(profileId);
  const profile = profileResponse.data;
  const isCurrentUser = session?.user?.userId === profileId;
  const currentIdentity = session?.user;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 mt-28 pb-28 md:pb-8 px-4 md:px-6 lg:px-0">
      <ProfileInfomation
        profile={profile}
        isCurrentUser={isCurrentUser}
        currentUserRole={session?.user?.role}
        currentUserOrgId={currentIdentity?.orgId ?? null}
        badge={profile.badge}
      />
      <ProfileTabs
        isCurrentUser={isCurrentUser}
        isSessionInOrgMode={!!currentIdentity?.orgId}
        profileId={profileId}
        profile={profile}
        currentUserId={currentIdentity?.userId ?? session?.user?.userId ?? ""}
        currentUserOrgId={currentIdentity?.orgId ?? null}
        activeTab={tab ?? "posts"}
      />
    </div>
  );
}
