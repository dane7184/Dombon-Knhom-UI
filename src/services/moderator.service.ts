// Selects the real or mock moderator service. See organizer.service.ts.

import { USE_MOCK_DATA } from "@/config/data-source";
import * as api from "@/services/api/moderator.service";
import * as mock from "@/services/mock/moderator.service";

const service: typeof api = USE_MOCK_DATA ? mock : api;

export const {
  getOrganizerRequest,
  getReportManagement,
  getDashboardSummary,
  getDashboardPendingEvents,
  getDashboardReportedEvents,
  getDashboardOrganizerRequests,
  getEventSubmissions,
  getEventDetail,
  patchEventStatus,
  reviewReportModerator,
} = service;
