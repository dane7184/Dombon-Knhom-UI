import React, { Suspense } from "react";
import ReportsClient from "@/components/dashboard/system-admin/ReportsClient";
import { getReportsServer } from "@/services/admin.service";

export default async function Page() {
  const initialData = await getReportsServer({
    sort: "Newest",
    page: 1,
    size: 11,
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportsClient initialData={initialData} />
    </Suspense>
  );
}
