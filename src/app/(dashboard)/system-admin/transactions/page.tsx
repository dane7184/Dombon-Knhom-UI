import React from "react";
import TransactionManagement from "@/components/dashboard/system-admin/TransactionManagement";
 
export default async function Page() {
  return (
    <div className="h-full">
      <TransactionManagement />
    </div>
  );
}