import "@/app/globals.css";
import {ProfileInfomation} from "@/components/profile/ProfileInfomation";
import {auth} from "@/lib/auth";
import {getOrgProfile, getProfile} from "@/services/profileInfo.service";
import {notFound} from "next/navigation";
import {EventAppStatus} from "@/components/profile/FilterEventComponent";
import {AppContentType} from "@/types/common.type";
import ProfileTabs from "@/components/profile/ProfileTabs";

interface PageProps {
  params: Promise<{ id?: string }>;
  searchParams?: Promise<{
    tab?: string;
    status?: EventAppStatus;
    content?: AppContentType;
  }>;
}

export default async function page({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) notFound();

  const resolvedSearchParams = (await searchParams) ?? {};
  const { tab, status, content } = resolvedSearchParams;
  const activeStatus = (status as EventAppStatus) ?? "Published";

  const session = await auth();
  const currentIdentity = session?.user

  const currentUserId = currentIdentity?.userId ?? session?.user?.userId ?? "";
  const currentOrgId = currentIdentity?.orgId ?? null;

  // "Organizer" role means the token was issued in org-switch mode
  const isSessionInOrgMode =
    session?.user?.role === "Organizer" && !!currentOrgId;

  // Try user profile first, fallback to org profile
  let profileResponse;
  let isOrgProfile = false;

  try {
    profileResponse = await getProfile(id);
  } catch {
    try {
      profileResponse = await getOrgProfile(id);
      isOrgProfile = true;
    } catch {
      notFound();
    }
  }

  const badge = profileResponse?.data?.badge;

  const profile = profileResponse?.data;
  if (!profile) notFound();
  if (profile.avatar === "") profile.avatar = null;

  const isCurrentUser = isOrgProfile
    ? id === currentOrgId && isSessionInOrgMode
    : id === currentUserId && !isSessionInOrgMode;


    

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 mt-28 pb-28 md:pb-8 px-4 md:px-6 lg:px-0">
      <ProfileInfomation
        profile={profile}
        isCurrentUser={isCurrentUser}
        currentUserRole={session?.user?.role}
        currentUserOrgId={currentOrgId}
        isOrgProfile={isOrgProfile}
        badge={badge}
      />
      <ProfileTabs
        profileId={id}
        profile={profile}
        currentUserId={currentUserId}
        currentUserOrgId={currentOrgId}
        isCurrentUser={isCurrentUser}
        isSessionInOrgMode={isSessionInOrgMode}
        isOrgProfile={isOrgProfile}
        activeContent={(content as AppContentType) ?? "Event"}
        activeTab={tab ?? "posts"}
        activeStatus={activeStatus}
      />
    </div>
  );
}
