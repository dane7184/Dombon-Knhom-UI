// Selects the real or mock moderation-organizer service. See organizer.service.ts.

import { USE_MOCK_DATA } from "@/config/data-source";
import * as api from "@/services/api/moderation-organizer.service";
import * as mock from "@/services/mock/moderation-organizer.service";

const service: typeof api = USE_MOCK_DATA ? mock : api;

export const { getOrganizerRequests, getOrgRequestDetail, patchOrganizerStatus } = service;
