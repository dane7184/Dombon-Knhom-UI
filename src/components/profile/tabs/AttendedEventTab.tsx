import AttendedEventList from '../AttendedEventList';
import { getAttendedEvents } from '@/services/profileInfo.service';

export default async function AttendedEventTab({ userId }: { userId: string }) {
  let initialData = null;

  try {
    const res = await getAttendedEvents(userId);
    initialData = res.data;
  } catch (err) {
    console.error("AttendedEventTab error:", err);
    return <p className="text-desc text-center">Failed to load events.</p>;
  }

  if (!initialData || initialData.content.length === 0) {
    return <p className="text-desc text-center">No events found.</p>;
  }

  return (
    <AttendedEventList
      userId={userId}
      initialData={initialData}
    />
  );
}