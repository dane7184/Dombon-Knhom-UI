"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { usePathname } from "next/navigation";

type Props = {
  children: React.ReactNode;
  role: "Admin" | "Moderator" | "Organizer";
};

export default function DashboardShell({ children, role }: Props) {
  const pathname = usePathname();
  const hideSidebar =
    role === "Organizer" && /^\/organizer\/events\/\d+$/.test(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-(--color-bg) p-3 md:p-4 gap-4">
      {/* Sidebar — static on desktop */}
      {!hideSidebar && (
        <div className="hidden md:flex">
          <DashboardSidebar role={role} fullName={"Dara"} email={"dara@example.com"} />
        </div>
      )}

      {/* Sidebar — off-canvas drawer on mobile */}
      {!hideSidebar && mobileOpen && (
        <div className="md:hidden fixed inset-0 z-1000">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full p-3 animate-in slide-in-from-left duration-200">
            <DashboardSidebar
              role={role}
              fullName={"Dara"}
              email={"dara@example.com"}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <DashboardNavbar
          role={role}
          onMenuClick={() => setMobileOpen(true)}
          showMenu={!hideSidebar}
        />
        <main className="flex-1 overflow-auto flex flex-col min-h-0 no-scrollbar rounded-xl">
          {children}
        </main>
      </div>
    </div>
  );
}
