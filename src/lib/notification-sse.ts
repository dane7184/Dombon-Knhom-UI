// Live notification stream. The implementation lives in the notification
// service so mock mode can swap it out without touching the network.
export { subscribeToNotifications } from "@/services/notification.service";
