import { getActivities, getOrgActivities } from "@/services/profileInfo.service";
import PostTabsClient from "../PostTabsClient";

export default async function PostTabs({
  userId,
  isOrgProfile = false,
}: {
  userId: string;
  isOrgProfile?: boolean;
}) {
  let initialData = null;

  try {
    const res = isOrgProfile
      ? await getOrgActivities(userId)
      : await getActivities(userId);
    initialData = res.data;
  } catch {
    return <p className="text-desc text-center">Failed to load posts.</p>;
  }

  if (!initialData || initialData.content.length === 0) {
    return <p className="text-desc text-center">No posts found.</p>;
  }

  return (
    <PostTabsClient
      userId={userId}
      isOrgProfile={isOrgProfile}
      initialData={initialData}
    />
  );
}