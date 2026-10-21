import ProfileTabsClient from "./tabs/ProfileTabsClient";
import PostsTab from "./tabs/PostTabs";
import AttendedEventsTab from "./tabs/AttendedEventTab";
import CreatedEventsTab from "./tabs/CreatedEventTab";
import FavoriteTab from "./tabs/FavoriteTab";
import SavedTab from "./tabs/SavedTab";
import WalletTab from "./tabs/WalletTab";
import InfoTab from "./tabs/InfoTab";
import {Suspense} from "react";
import {ProfileInfoType} from "@/types/user.type";
import {AppContentType} from "@/types/common.type";
import {EventAppStatus} from "./FilterEventComponent";
import {redirect} from "next/navigation";

interface ProfileTabsProps {
  profileId: string;
  profile: ProfileInfoType;
  currentUserId: string;
  currentUserOrgId: string | null;
  isCurrentUser: boolean;
  isSessionInOrgMode: boolean;
  activeTab: string;
  activeStatus?: EventAppStatus;
  activeContent?: AppContentType;
  isOrgProfile?: boolean;
}

function TabFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--main-color) border-t-transparent" />
    </div>
  );
}

const PRIVATE_TABS = ["attended", "favorite", "saved", "wallet", "info"];
const PUBLIC_STATUSES: EventAppStatus[] = ['Published'];

function renderTabContent({
  activeTab,
  profileId,
  profile,
  activeStatus,
  isCurrentUser,
  isOrgProfile,
  currentUserOrgId
}: {
  activeTab: string;
  profileId: string;
  currentUserId: string;
  profile: ProfileInfoType;
  activeStatus?: EventAppStatus;
  isCurrentUser: boolean;
  isOrgProfile: boolean;
  currentUserOrgId: string | null;
}) {


  if (!isCurrentUser && PRIVATE_TABS.includes(activeTab)) {
    redirect(`/profile/${profileId}?tab=posts`);
  }


  if (!isCurrentUser && activeTab === 'created' && activeStatus && !PUBLIC_STATUSES.includes(activeStatus)) {
    redirect(`/profile/${profileId}?tab=created&status=Published`);
  }

  switch (activeTab) {
    case "posts":
      return <PostsTab userId={profileId} isOrgProfile={isOrgProfile} />;
    case "created":
      return (
        <CreatedEventsTab
          userId={profileId}
          isCurrentUser={isCurrentUser}
          activeStatus={activeStatus}
          isOrgProfile={isOrgProfile}
          currentUserOrgId={currentUserOrgId}
        />
      );
    case "attended":
      return <AttendedEventsTab userId={profileId} />;
    case "favorite":
      return <FavoriteTab userId={profileId} isOrgProfile={isOrgProfile}/>;
    case "saved":
      return <SavedTab userId={profileId} isOrgProfile={isOrgProfile} />;
    case "wallet":
      return <WalletTab />;
    case "info":
      return <InfoTab profile={profile} />;
    default:
      return <PostsTab userId={profileId} isOrgProfile={isOrgProfile} />;
  }
}

export default function ProfileTabs({
  profileId,
  profile,
  currentUserId,
  currentUserOrgId,
  isCurrentUser,
  isSessionInOrgMode,
  activeTab,
  activeStatus,
  isOrgProfile = false,
}: ProfileTabsProps) {
  const effectiveOrgId = isOrgProfile ? profileId : profile.orgId || currentUserOrgId;

  const tabContent = renderTabContent({
    activeTab,
    profileId,
    currentUserId,
    profile,
    activeStatus,
    isCurrentUser,
    isOrgProfile,
    currentUserOrgId: effectiveOrgId,
  });

  return (
    <ProfileTabsClient
      profileId={profileId}
      currentUserId={currentUserId}
      currentUserOrgId={currentUserOrgId}
      isCurrentUser={isCurrentUser}
      isSessionInOrgMode={isSessionInOrgMode}
    >
      <Suspense fallback={<TabFallback />}>{tabContent}</Suspense>
    </ProfileTabsClient>
  );
}
