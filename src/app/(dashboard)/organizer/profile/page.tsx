import React from "react";
import PersonalInfo from "@/components/dashboard/organizer/PersonalInfo";
import AccountSettings from "@/components/dashboard/organizer/AccountSetting";

export default function ProfileOverview() {
  return (
    <div className="w-full flex flex-col gap-4 box-shadow">
      <div className="flex flex-col gap-4">
        <PersonalInfo />
        <AccountSettings />
      </div>

    </div>
  );
}