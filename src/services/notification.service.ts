// Selects the real or mock notification service. See organizer.service.ts.

import { USE_MOCK_DATA } from "@/config/data-source";
import * as api from "@/services/api/notification.service";
import * as mock from "@/services/mock/notification.service";

export type {
  NotificationListResponse,
  UnreadCountResponse,
} from "@/services/api/notification.service";

const service: typeof api = USE_MOCK_DATA ? mock : api;

export const {
  getNotifications,
  getNotificationsClient,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getCommentContext,
  subscribeToNotifications,
} = service;
