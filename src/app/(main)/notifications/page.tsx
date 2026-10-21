import NotificationPage from "@/components/notifications/notificationPage";

export default function UserNotificationsPage() {
  return (
    <div className="pb-4 pt-28 px-4 md:px-6 h-[calc(102.5vh-1rem)] max-w-6xl mx-auto overflow-hidden flex flex-col min-h-0">
      <NotificationPage role="user" />
    </div>
  );
}
