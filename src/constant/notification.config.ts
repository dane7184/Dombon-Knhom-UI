import {
  Heart,
  MessageCircle,
  UserPlus,
  CheckCircle,
  XCircle,
  BadgeCheck,
  ShieldAlert,
  Wallet,
  Star,
  Flag,
  LucideIcon,
} from "lucide-react";
import { NotificationType } from "@/types/notification.type";

export const NotificationConfig: Record<
  NotificationType,
  { icon: LucideIcon; color: string; label: string }
> = {
  Like: { icon: Heart, color: "#3B82F6", label: "New reaction" },
  Comment: { icon: MessageCircle, color: "#3B82F6", label: "New comment" },
  JoinEvent: { icon: UserPlus, color: "#8B5CF6", label: "Event join request" },
  JoinEventSuccess: {
    icon: CheckCircle,
    color: "#10B981",
    label: "Joined event",
  },
  EventApproved: {
    icon: CheckCircle,
    color: "#10B981",
    label: "Event approved",
  },
  EventRejected: { icon: XCircle, color: "#EF4444", label: "Event rejected" },
  OrgRequestApproved: {
    icon: BadgeCheck,
    color: "#10B981",
    label: "Organization approved",
  },
  OrgRequestRejected: {
    icon: XCircle,
    color: "#EF4444",
    label: "Organization rejected",
  },
  ReportApproved: { icon: Flag, color: "#10B981", label: "Report approved" },
  ReportRejected: { icon: Flag, color: "#6B7280", label: "Report rejected" },
  WithdrawalApproved: {
    icon: Wallet,
    color: "#10B981",
    label: "Withdrawal approved",
  },
  WithdrawalRejected: {
    icon: Wallet,
    color: "#EF4444",
    label: "Withdrawal rejected",
  },
  PostRemoved: { icon: ShieldAlert, color: "#F59E0B", label: "Post removed" },
  EventRemoved: {
    icon: ShieldAlert,
    color: "#F59E0B",
    label: "Event removed",
  },
  Rated: { icon: Star, color: "#F59E0B", label: "New rating" },
};
