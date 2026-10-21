import React from "react";
import KpiGridAdmin from "@/components/dashboard/system-admin/KpiGridAdmin";
import RecentUser from "@/components/dashboard/system-admin/RecentUser";
import CategoryList from "@/components/dashboard/system-admin/CategoryList";
import {auth} from "@/lib/auth"
import {getAdminKPI, getCategories, getRecentUser} from "@/services/admin.service";

export default async function page() {
    const session = await auth();
    const accessToken = session?.user.accessToken;
    if (!accessToken) return null;
    const dataKPI = await getAdminKPI(accessToken);

    const categories = await getCategories(accessToken);

    const recnentUser = await getRecentUser(accessToken, { page: 1, size: 10 });

  return (
    <div className="flex flex-1 h-full flex-col gap-4">
      <div className="w-full">
        <KpiGridAdmin dataKPI={dataKPI}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        <div className="lg:col-span-3 min-h-0 min-w-0">
          <RecentUser recnentUser={recnentUser}/>
        </div>

        <div className="lg:col-span-1 min-h-0">
          <CategoryList
              categories={categories.content}
              accessToken={accessToken}
          />
        </div>
      </div>
    </div>
  );
}
