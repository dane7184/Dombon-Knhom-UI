'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchBarComponent } from './SearchBarComponent';
import EventCardComponent from './EventCardComponent';
import FilterEventComponent, { EventAppStatus } from './FilterEventComponent';
import { EventProfileRespone } from '@/types/event.type';
import { CursorData } from '@/types/common.type';
import { getCreatedEventsPage } from '@/services/profileInfo.service';

interface CreatedEventListProps {
  userId: string;
  initialData: CursorData<EventProfileRespone>;
  isCurrentUser: boolean;
  activeStatus: EventAppStatus;
  isOrgProfile?: boolean;
  currentUserOrgId?: string | null;
}

export default function CreatedEventList({
  userId,
  initialData,
  isCurrentUser,
  activeStatus,
  isOrgProfile = false,
  currentUserOrgId,
}: CreatedEventListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<EventProfileRespone[]>(initialData.content);
  const [nextCursor, setNextCursor] = useState<string | null>(initialData.nextCursor ?? "");
  const [hasNext, setHasNext] = useState(initialData.hasNext);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [prevInitialData, setPrevInitialData] = useState(initialData);
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    setEvents(initialData.content);
    setNextCursor(initialData.nextCursor ?? "");
    setHasNext(initialData.hasNext);
  }

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchMore = useCallback(async () => {
    if (loading || !hasNext || !nextCursor) return;
    setLoading(true);
    try {
      const data: CursorData<EventProfileRespone> = await getCreatedEventsPage(
        userId,
        nextCursor,
        isOrgProfile,
        activeStatus,
      );

      setEvents((prev) => [...prev, ...(data.content ?? [])]);
      setNextCursor(data.nextCursor ?? null);
      setHasNext(data.hasNext ?? false);
    } catch (err) {
      console.error('Failed to load more created events:', err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasNext, nextCursor, userId, activeStatus, isOrgProfile]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) fetchMore(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchMore]);

  const handleStatusChange = (status: EventAppStatus) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('status', status);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-5 pb-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <div className="w-full sm:w-[33%]">
          <SearchBarComponent
            value={searchTerm}
            onChangeAction={setSearchTerm}
            placeholder="Search by name..."
          />
        </div>
        {isCurrentUser && !isOrgProfile && (
          <FilterEventComponent value={activeStatus} onChange={handleStatusChange} />
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((event) => (
            <EventCardComponent
              key={event.eventId}
              {...event}
              isCurrentUser={isCurrentUser}
              currentUserOrgId={currentUserOrgId}
              isOrgProfile={isOrgProfile}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-desc text-center">No events found.</p>
        </div>
      )}

      <div ref={sentinelRef} className="flex justify-center py-4">
        {loading && (
          <div className="w-6 h-6 border-2 border-t-transparent border-(--primary) rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}