// Selects the real or mock user search service. See organizer.service.ts.

import { USE_MOCK_DATA } from "@/config/data-source";
import * as api from "@/services/api/searchName.service";
import * as mock from "@/services/mock/searchName.service";

export type { ApiSearchUser } from "@/services/api/searchName.service";

const service: typeof api = USE_MOCK_DATA ? mock : api;

export const { getMeByName, searchUsersService } = service;
