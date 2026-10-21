import React from "react";
import "@/app/globals.css";
import { notFound } from "next/navigation";
import {
  getEventDetail,
  getEventComments,
  getOrgProfile,
  getUserProfile,
} from "@/services/event.service";
import {
  EventDetail as EventDetailType,
  EventCommentComponent,
} from "@/types/event.type";
import EventDetail from "@/components/events/EventDetail";
import { auth } from "@/lib/auth";
import { getMe } from "@/services/auth.service";

type EventDetailPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

import { Metadata } from "next";
import { FRONTEND_URL } from "@/lib/url";
import { resolveUrl } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventId: string }>;
}): Promise<Metadata> {
  const { eventId } = await params;

  let event = null;
  try {
    event = await getEventDetail(eventId);
  } catch {
    // API error (e.g. 401 without auth) — fall back to defaults
  }

  if (!event) {
    return {
      title: "Event | Dombon Khnom",
      description: "Discover events on Dombon Khnom.",
    };
  }

  const imageUrl = event.imageUrl
    ? resolveUrl(event.imageUrl)
    : `${FRONTEND_URL}/images/default-event.png`;

  return {
    title: `${event.title} | Dombon Khnom`,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      url: `${FRONTEND_URL}/events/${eventId}`,
      siteName: "Dombon Khnom",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: event.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description,
      images: [imageUrl],
    },
  };
}

export default async function page({ params }: EventDetailPageProps) {
  const { eventId } = await params;

  const session = await auth();
  let me = null;
  if (session) {
    const res = await getMe();
    me = res.data ?? [];
  }

  let event: EventDetailType | null = null;
  let comment: EventCommentComponent = {
    comments: [],
    nextCursor: null,
    hasNext: false,
  };

  try {
    event = await getEventDetail(eventId);
    // console.log("Fetched event:", event);
  } catch (error) {
    console.error("Unable to load event detail:", error);
  }

  try {
    comment = await getEventComments(eventId);
    // console.log("Fetched comments:", comment);
  } catch (error) {
    console.error("Unable to load comments:", error);
  }

  let profile = null;
  if (event?.organizerId) {
    profile = await getOrgProfile(event.organizerId);
  } else if (event?.creatorId) {
    profile = await getUserProfile(event.creatorId);
  }

  if (!event) {
    notFound();
  }

  return (
    <>
      <div className="px-4 md:px-[15%] mx-auto pt-28 pb-24 md:pb-4">
        {/* ratingSummary and inlineRatings are already inside event from getEventDetail */}
        <EventDetail
          event={event!}
          comment={comment}
          profile={profile}
          me={me}
        />
      </div>
    </>
  );
}
