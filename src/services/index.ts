// Entry point for the data layer.
//
// Each `<domain>.service.ts` next to this file is a selector: it exports the
// same functions as `api/<domain>.service.ts` (real backend) and picks either
// that implementation or `mock/<domain>.service.ts` (local fixtures from
// src/mocks) based on NEXT_PUBLIC_DATA_SOURCE — see src/config/data-source.ts.
// Existing code imports the selectors directly (e.g. "@/services/event.service");
// these namespaces are a convenience for new code.
//
// tagService is a "use server" module and is imported directly instead.

export { DATA_SOURCE, USE_MOCK_DATA } from "@/config/data-source";

export * as activityService from "@/services/activity.service";
export * as adminService from "@/services/admin.service";
export * as authService from "@/services/auth.service";
export * as categoryService from "@/services/category.service";
export * as eventService from "@/services/event.service";
export * as favoriteService from "@/services/favorite.service";
export * as moderationOrganizerService from "@/services/moderation-organizer.service";
export * as moderatorService from "@/services/moderator.service";
export * as notificationService from "@/services/notification.service";
export * as organizerService from "@/services/organizer.service";
export * as paymentService from "@/services/payment.service";
export * as profileInfoService from "@/services/profileInfo.service";
export * as searchNameService from "@/services/searchName.service";
export * as userService from "@/services/user.service";
