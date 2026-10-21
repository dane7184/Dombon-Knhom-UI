import React from "react";
import { notFound } from "next/navigation";
import {
  getEventDetail,
  getEventComments,
  getOrgProfile,
  getUserProfile,
  getEventAttendeesPreview,
} from "@/services/event.service";
import {
  EventDetail as EventDetailType,
  EventCommentComponent,
} from "@/types/event.type";
import EventDetail from "@/components/events/EventDetail";
import { auth } from "@/lib/auth";
import { getMe } from "@/services/auth.service";

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { eventId } = await params;

  const session = await auth();
  let me = null;
  if (session) {
    const res = await getMe();
    me = res.data ?? null;
  }

  let event: EventDetailType | null = null;
  let comment: EventCommentComponent = {
    comments: [],
    nextCursor: null,
    hasNext: false,
  };

  try {
    event = await getEventDetail(eventId);
  } catch (error) {
    console.error("Unable to load event detail:", error);
  }

  try {
    comment = await getEventComments(eventId);
  } catch (error) {
    console.error("Unable to load comments:", error);
  }

  let profile = null;
  if (event?.organizerId) {
    profile = await getOrgProfile(event.organizerId);
  } else if (event?.creatorId) {
    profile = await getUserProfile(event.creatorId);
  }

  if (!event) notFound();

  return (
    <div className="w-full mx-auto pt-0 flex flex-col gap-4">
      <div className="max-w-8xl mx-auto w-full">
        <EventDetail
          event={event!}
          comment={comment}
          profile={profile}
          me={me}
          showExportBtn={true}
          maxWidthClass="max-w-full"
          hideBackButton={false}
          isOrganizerView={true}
        />
      </div>
    </div>
  );
}
