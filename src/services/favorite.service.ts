// Selects the real or mock favorites service. See organizer.service.ts.

import { USE_MOCK_DATA } from "@/config/data-source";
import * as api from "@/services/api/favorite.service";
import * as mock from "@/services/mock/favorite.service";

const service: typeof api = USE_MOCK_DATA ? mock : api;

export const { getFavorites, getOrgFavorites } = service;
