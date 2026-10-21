import SavedList from '../SavedList';
import { getSavedEvents, getSavedActivities, getOrgSavedEvents, getOrgSavedActivities } from '@/services/profileInfo.service';
import { CursorData } from '@/types/common.type';
import { EventProfileRespone } from '@/types/event.type';
import { ActivitiesResponse } from '@/types/activity.type';

const EMPTY_CURSOR = <T,>(): CursorData<T> => ({ content: [], nextCursor: null, hasNext: false });

export default async function SavedTab({ userId, isOrgProfile }: { userId: string; isOrgProfile: boolean }) {
  let eventsData: CursorData<EventProfileRespone> = EMPTY_CURSOR();
  let activitiesData: CursorData<ActivitiesResponse> = EMPTY_CURSOR();

  try {
    const [eventsRes, activitiesRes] = await Promise.all([
      isOrgProfile ? getOrgSavedEvents(userId) : getSavedEvents(userId),
      isOrgProfile ? getOrgSavedActivities(userId) : getSavedActivities(userId),
    ]);
    eventsData = {
      ...eventsRes.data,
      content: (eventsRes.data?.content ?? []).map(e => ({ ...e, isSaved: true })),
    };
    activitiesData = activitiesRes.data ?? EMPTY_CURSOR();
  } catch (err) {
    console.error('SavedTab error:', err);
    return <p className="text-desc text-center">Failed to load saved items.</p>;
  }

  return (
    <SavedList
      userId={userId}
      isOrgProfile={isOrgProfile}
      initialEvents={eventsData}
      initialActivities={activitiesData}
    />
  );
}