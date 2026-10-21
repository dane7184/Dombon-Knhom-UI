// Selects the real or mock user service. See organizer.service.ts.

import { USE_MOCK_DATA } from "@/config/data-source";
import * as api from "@/services/api/user.service";
import * as mock from "@/services/mock/user.service";

const service: typeof api = USE_MOCK_DATA ? mock : api;

export const { getMe, getCurrentUserProfile } = service;
