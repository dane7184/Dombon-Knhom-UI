import React, { Suspense } from "react";
import SidebarSearch from "@/components/discovery/SidebarSearch";
import FavoritesSidebar from "@/components/discovery/FavoritesSidebar";
import CreatePostInput from "@/components/discovery/CreatePostInput";
import FeedList from "@/components/discovery/FeedList";
import EventsSidebar from "@/components/discovery/EventsSidebar";
import TrendyTag from "@/components/discovery/TrendyTag";
import { auth } from "@/lib/auth";
import { UpcomingEventRequest } from "@/types/event.type";
import { formatTableDate } from "@/lib/format";
import { fetchUpcomingEvents } from "@/services/event.service";
import { fetchActivityFeed } from "@/services/activity.service";
import { getMe } from "@/services/auth.service";
import { CreatePostSkeleton } from "@/components/discovery/CreatePostSkeleton";
import { FeedSkeleton } from "@/components/discovery/FeedSkeleton";
import { EventsSkeleton } from "@/components/discovery/EventSkeleton";

async function FeedSection({
  accessToken,
  userId,
  orgId,
}: {
  accessToken: string;
  userId: string;
  orgId?: string | null;
}) {
  const { activities, nextCursor, hasNext } = await fetchActivityFeed(
    undefined,
    accessToken,
    userId,
    orgId,
  );
  return (
    <FeedList
      initialActivities={activities}
      initialCursor={nextCursor}
      initialHasNext={hasNext}
    />
  );
}
async function CreatePostSection({ isOrgMode }: { isOrgMode: boolean }) {
  const meRes = await getMe().catch(() => null);
  const serverAvatarUrl: string | null = isOrgMode
    ? meRes?.data?.orgLogo || null
    : meRes?.data?.avatar || null;
  return <CreatePostInput serverAvatar={serverAvatarUrl} />;
}

async function EventsSection() {
  const appendDate = new Date();
  const req: UpcomingEventRequest = {
    actorId: "",
    isOrg: true,
    search: "",
    boundaryWkt: "",
    cursor: "",
    size: 4,
    startFrom: formatTableDate(
      new Date(appendDate.setDate(appendDate.getDate() + 1)),
    ),
    endAt: "",
    categoryIds: [],
  };
  const data = await fetchUpcomingEvents(req);
  return <EventsSidebar upcomingEvent={data} />;
}

export default async function page() {
  const session = await auth();
  const userId = session?.user?.userId;
  const accessToken = session?.user?.accessToken;

  if (!userId || !accessToken) {
    return null;
  }

  const isOrgMode = !!session?.user?.orgId;

  return (
    <div className="w-full flex-1 flex flex-col min-h-0">
      <div className="w-full xl:w-full h-full mx-auto sm:px-1 lg:px-1 xl:pb-1">
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 h-full w-full">
          <aside className="hidden lg:flex flex-col lg:col-span-3 h-full gap-4">
            <SidebarSearch />
            <FavoritesSidebar userId={userId} orgId={session?.user?.orgId} />
          </aside>

          <main className="col-span-1 lg:col-span-5 h-full flex flex-col min-h-0">
            <div
              data-feed-header
              className="flex flex-col w-full pb-4 bg-[var(--background-color)]"
            >
              <Suspense fallback={<CreatePostSkeleton />}>
                <CreatePostSection isOrgMode={isOrgMode} />
              </Suspense>
            </div>

            <div
              id="feed-scroll-container"
              className="flex-1 overflow-y-auto rounded-xl md:rounded-2xl pb-28 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              <Suspense fallback={<FeedSkeleton />}>
                <FeedSection accessToken={accessToken} userId={userId} orgId={session?.user?.orgId} />
              </Suspense>
            </div>
          </main>

          <aside className="hidden lg:block lg:col-span-3">
            <div className="flex flex-col w-full gap-4 mx-auto">
              <Suspense fallback={<EventsSkeleton />}>
                <EventsSection />
              </Suspense>
              <TrendyTag />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
