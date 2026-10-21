export type NotificationType =
  | "Like"
  | "Comment"
  | "JoinEvent"
  | "JoinEventSuccess"
  | "EventApproved"
  | "EventRejected"
  | "OrgRequestApproved"
  | "OrgRequestRejected"
  | "ReportApproved"
  | "ReportRejected"
  | "WithdrawalApproved"
  | "WithdrawalRejected"
  | "PostRemoved"
  | "EventRemoved"
  | "Rated";

export type NotificationTargetType = "Event" | "Activity" | "Org" | "User";

export interface NotificationItem {
  notificationId: string;
  notifiableType: NotificationType;
  notifiableId: string;
  targetId: string | null;
  targetType: NotificationTargetType | null;
  title: string;
  readAt: string | null;
  createdAt: string;
  actorName: string;
  actorAvatar: string | null;
  read: boolean;
}

export interface TitleSegment {
  text: string;
  bold: boolean;
}

export interface CommentContext {
  anchorId: string;
  targetId: string;
  targetType: NotificationTargetType;
  parentId: string | null;
  cursor: string | null;
}
