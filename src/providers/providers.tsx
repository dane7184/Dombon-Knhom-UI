"use client";
import { ReactNode, useState } from "react";
import { makeQueryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { Toaster } from "sonner";
import NotificationProvider from "@/providers/NotificationProvider";

export default function Providers({ children, session }: { children: ReactNode; session: Session | null }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          <NotificationProvider>{children}</NotificationProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                fontFamily:
                  "var(--font-poppins), var(--font-inter), sans-serif",
              },
            }}
          />
        </SessionProvider>
      </QueryClientProvider>
    </>
  );
}
