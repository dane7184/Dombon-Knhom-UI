"use client";

import { ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { subscribeToNotifications } from "@/lib/notification-sse";
import { getUnreadCount } from "@/services/notification.service";
import { NotificationConfig } from "@/constant/notification.config";
import { buildNotificationMessage } from "@/lib/notification.util";
import Toast from "@/components/modals/Toast";

export const NOTIFICATIONS_LIST_KEY = ["notifications", "list"] as const;
export const NOTIFICATIONS_UNREAD_KEY = ["notifications", "unread-count"] as const;

export function useUnreadNotificationsCount() {
  const { status } = useSession();

  return useQuery({
    queryKey: NOTIFICATIONS_UNREAD_KEY,
    queryFn: async () => (await getUnreadCount()).data,
    enabled: status === "authenticated",
    staleTime: 1000 * 60,
  });
}

export default function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    const accessToken = session?.user?.accessToken;
    if (status !== "authenticated" || !accessToken) return;

    const unsubscribe = subscribeToNotifications(accessToken, (notification) => {
      queryClient.setQueryData<number>(
        NOTIFICATIONS_UNREAD_KEY,
        (count) => (count ?? 0) + 1,
      );
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_LIST_KEY });

      const config = NotificationConfig[notification.notifiableType];
      const message = buildNotificationMessage(notification)
        .map((segment) => segment.text)
        .join("");

      toast.custom((t) => (
        <Toast
          title={config?.label ?? "New notification"}
          message={message}
          type="success"
          onCloseAction={() => toast.dismiss(t)}
        />
      ));
    });

    return unsubscribe;
  }, [status, session?.user?.accessToken, queryClient]);

  return <>{children}</>;
}
