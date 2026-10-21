import {getCommentContext} from "@/services/notification.service";
import {
    NotificationItem,
    TitleSegment,
    NotificationType,
    NotificationTargetType,
} from "@/types/notification.type";

const BOLD_WORDS = new Set(["approved", "rejected", "removed", "reported"]);

export function parseNotificationTitle(title: string): TitleSegment[] {
    const segments: TitleSegment[] = [];

    // First split by {{}} markers
    const parts = title.split(/(\{\{.*?}})/g);

    for (const part of parts) {
        if (part.startsWith("{{")) {
            // name/entity — always bold
            segments.push({text: part.replace(/\{\{|}}/g, ""), bold: true});
        } else {
            // plain text — split further by words to catch BOLD_WORDS
            const words = part.split(/(\s+)/);
            for (const word of words) {
                const lower = word.trim().toLowerCase();
                segments.push({text: word, bold: BOLD_WORDS.has(lower)});
            }
        }
    }

    return segments;
}


export function formatRelativeTime(isoString: string): string {
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffWk = Math.floor(diffDay / 7);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffWk < 4) return `${diffWk}w ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
}

export function isUnread(item: NotificationItem): boolean {
    return !item.read;
}

// Combines the actor's name with the notification title, e.g.
// "Kim Dara" + "liked your post" -> "Kim Dara liked your post"
export function buildNotificationMessage(item: NotificationItem): TitleSegment[] {
    return [
        {text: item.actorName, bold: true},
        {text: " ", bold: false},
        ...parseNotificationTitle(item.title),
    ];
}

const TARGET_ROUTES: Record<string, (id: string) => string> = {
    Event: (id) => `/events/${id}`,
    Activity: (id) => `/posts/${id}`,
    Org: (id) => `/profile/${id}`,
    Organization: (id) => `/profile/${id}`,
    User: (id) => `/profile/${id}`,
};

export function determineTargetType(type: NotificationType): NotificationTargetType | null {
    switch (type) {
        case "JoinEvent":
        case "JoinEventSuccess":
        case "EventApproved":
        case "EventRejected":
        case "EventRemoved":
        case "Rated":
            return "Event";
        case "PostRemoved":
        case "Like":
            return "Activity";
        case "OrgRequestApproved":
        case "OrgRequestRejected":
        case "WithdrawalApproved":
        case "WithdrawalRejected":
            return "Org";
        default:
            return null;
    }
}

// Resolves where a notification should navigate to when clicked.
export async function resolveNotificationPath(
    item: NotificationItem,
): Promise<string | null> {
    const targetType = item.targetType || determineTargetType(item.notifiableType);

    // 1. Comments always need the anchor (and parent, for replies) resolved via
    //    the comment-context endpoint so the link lands on the comment itself.
    if (item.notifiableType === "Comment") {
        try {
            const context = await getCommentContext(item.notifiableId, targetType);
            const routeFn = TARGET_ROUTES[context.targetType];
            if (!routeFn) return null;
            const base = routeFn(context.targetId);
            const params = new URLSearchParams({commentId: context.anchorId});
            if (context.parentId) params.set("parentId", context.parentId);
            return `${base}?${params.toString()}`;
        } catch (error) {
            console.error("Failed to resolve comment context:", error);
            if (targetType && item.targetId) {
                const routeFn = TARGET_ROUTES[targetType];
                return routeFn ? routeFn(item.targetId) : null;
            }
            return null;
        }
    }

    // 2. Specific notifications by notifiableType (mostly dashboard routes)
    switch (item.notifiableType) {
        case "Like": {
            const type = targetType || "Activity";
            console.log("type", type);
            console.log("type item", item.targetType);
            const id = item.targetId || item.notifiableId;
            const routeFn = TARGET_ROUTES[type];
            return routeFn ? routeFn(id) : null;
        }
        
        case "JoinEvent":
            // Organizer receives request to join event. Target is the Event.
            return item.targetId ? `/organizer/events/${item.targetId}/attendees` : null;

        case "EventRejected":
            // Organizer event submission was rejected. Route to organizer dashboard to edit.
            return item.targetId ? `/organizer/events/${item.targetId}` : "/organizer/events";

        case "WithdrawalApproved":
        case "WithdrawalRejected":
            // Withdrawal request approval/rejection. Route to organizer wallet.
            return "/organizer/wallet";

        case "OrgRequestRejected":
            return "/profile";
            
        case "PostRemoved":
        case "EventRemoved":
            return "/profile";
    }

    // 3. Fallback: When the backend already provides a target, route there directly.
    if (targetType && item.targetId) {
        const routeFn = TARGET_ROUTES[targetType];
        return routeFn ? routeFn(item.targetId) : null;
    }

    return null;
}
