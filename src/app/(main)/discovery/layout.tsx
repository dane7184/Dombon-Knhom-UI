import React from "react";
import ViewTab from "@/components/discovery/ViewTab";

interface DiscoveryLayoutProps {
  children: React.ReactNode;
}

export default function DiscoveryLayout({ children }: DiscoveryLayoutProps) {
  return (
    <div className="w-full h-screen px-4 sm:px-6 md:px-10 lg:px-30 pt-28 flex flex-col gap-4 fixed bg-background">
      <div className="w-full">
        <ViewTab />
      </div>
      <main className="flex-1 min-h-0 w-full h-full flex flex-col">
        {children}
      </main>
    </div>
  );
}
