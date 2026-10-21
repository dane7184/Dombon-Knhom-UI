import React from "react";
import ScanClient from "@/components/dashboard/organizer/ScanClient";
import { getEventManagementAction } from "@/actions/organizer.action";

export const dynamic = "force-dynamic";

export default async function Page() {
  const result = await getEventManagementAction();
  const events = result.success ? result.data.events : [];

  return (
    <div className="h-full">
      <ScanClient events={events} />
    </div>
  );
}
