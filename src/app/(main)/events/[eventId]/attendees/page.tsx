import React from "react";
import Link from "next/link";
import { ArrowLeft } from "iconsax-react";
import { getEventAttendeesPreview, getEventDetail } from "@/services/event.service";
import { notFound } from "next/navigation";
import { AttendeesTable } from "@/app/(dashboard)/organizer/events/[eventId]/attendees/_components/AttendeesTable";

export default async function AttendeesPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  if (!eventId) {
    notFound();
    return;
  }

  const event = await getEventDetail(eventId);
  if (!event) notFound();

  const attendees = await getEventAttendeesPreview(eventId);

  return (
    <div className="w-full mx-auto pt-28 pb-4 px-4 md:px-[15%] flex flex-col gap-4">

      <div className="w-full">
        <AttendeesTable eventId={eventId} eventTitle={event.title} attendees={attendees} showBackButton={true} />
      </div>
    </div>
  );
}
