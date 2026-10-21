import React from "react";
import WithdrawalManagement from "@/components/dashboard/system-admin/WithdrawalManagement";
import WithdrawalKpi from "@/components/dashboard/system-admin/WithdrawalKpi";
import {getWithdrawalKpi} from "@/services/admin.service";

export default async function Page() {
  const dataKpi = await getWithdrawalKpi();
  return (
    <div className="flex-1 w-full h-full flex flex-col min-h-0 gap-1">
      <WithdrawalKpi dataKpi={dataKpi}/>


      <div className="flex-1 min-h-0 w-full">
        <WithdrawalManagement />
      </div>
    </div>
  );
}
