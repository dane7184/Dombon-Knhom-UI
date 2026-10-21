import React, { Suspense } from "react";
import EventsClientPanel from "@/components/dashboard/organizer/EventsPanel";
import { getEventManagementAction } from "@/actions/organizer.action";
import { auth } from "@/lib/auth";

export default async function Page() {
  const [result, session] = await Promise.all([
    getEventManagementAction(),
    auth(),
  ]);
  const orgId = session?.user?.orgId ?? "";

  return (
    <div className="w-full">
      <Suspense fallback={<div>Loading...</div>}>
        <EventsClientPanel
          orgId={orgId}
          initialEvents={result.data}
          initialError={
            result.success ? null : (result.error ?? "Failed to load events")
          }
        />
      </Suspense>
    </div>
  );
}
