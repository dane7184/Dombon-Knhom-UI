// src/app/(dashboard)/organizer/events/[eventId]/attendees/page.tsx

import React from "react";
import { getEventAttendeesPreview, getEventDetail } from "@/services/event.service";
import { notFound } from "next/navigation";
// Import client component directly (no dynamic import needed)
import { AttendeesTable } from "./_components/AttendeesTable";

export default async function AttendeesPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  if (!eventId) {
    console.error('Missing eventId in params');
    notFound();
    return;
  }

  // Fetch event details (optional, for header info)
  const event = await getEventDetail(eventId);
  if (!event) notFound();

  
  const attendees = await getEventAttendeesPreview(eventId);

  return (
    <div className="w-full mx-auto pt-0 flex flex-col gap-4">
      <div className="max-w-8xl mx-auto w-full">
        <AttendeesTable eventId={eventId} eventTitle={event.title} attendees={attendees} showBackButton />
      </div>
    </div>
  );
}
