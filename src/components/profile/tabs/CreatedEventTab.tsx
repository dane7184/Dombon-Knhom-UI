import CreatedEventList from '../CreatedEventList';
import { getCreatedEvents, getOrgCreatedEvents } from '@/services/profileInfo.service';
import { EventAppStatus } from '../FilterEventComponent';

interface CreatedEventTabProps {
  userId: string;
  isCurrentUser: boolean;
  activeStatus?: EventAppStatus;
  isOrgProfile?: boolean;
  currentUserOrgId?: string | null;
}

export default async function CreatedEventTab({
  userId,
  isCurrentUser,
  activeStatus = 'Published',
  isOrgProfile = false,
  currentUserOrgId,
}: CreatedEventTabProps) {
  let initialData = null;

  try {
    const res = isOrgProfile
      ? await getOrgCreatedEvents(userId)
      : await getCreatedEvents(userId, activeStatus);
    initialData = res.data;
  } catch {
    return <p className="text-desc text-center">Failed to load events.</p>;
  }

  if (!initialData || initialData.content.length === 0) {
    return (
      <CreatedEventList
        userId={userId}
        initialData={{ content: [], nextCursor: null, hasNext: false }}
        isCurrentUser={isCurrentUser}
        activeStatus={activeStatus}
        isOrgProfile={isOrgProfile}
        currentUserOrgId={currentUserOrgId}
      />
    );
  }

  return (
    <CreatedEventList
      userId={userId}
      initialData={initialData}
      isCurrentUser={isCurrentUser}
      activeStatus={activeStatus}
      isOrgProfile={isOrgProfile}
      currentUserOrgId={currentUserOrgId}
    />
  );
}