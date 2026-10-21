import "leaflet/dist/leaflet.css";
import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { BottomBar } from "@/components/layout/BottomBar";
import { auth } from "@/lib/auth";
import { getMe } from "@/services/auth.service";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let me = null;
  if (session) {
    const res = await getMe();
    me = res.data;
  }
  return (
    <div className="min-h-screen w-full bg-[#EDF5FA] relative flex flex-col">
      <div className="fixed top-0 left-0 w-full p-4 z-999 pointer-events-none flex justify-center">
        <div className="w-full pointer-events-auto">
          <Navbar
            fullName={me?.fullName ?? ""}
            avatar={me?.avatar ?? ""}
            userId={me?.userId ?? ""}
            orgId={me?.orgId ?? null}
            orgName={me?.orgName ?? null}
            orgLogo={me?.orgLogo ?? null}
          />
        </div>
      </div>
      <main className="w-full flex-1 relative">{children}</main>
      <BottomBar />
    </div>
  );
}
