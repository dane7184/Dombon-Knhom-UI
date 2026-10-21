// Selects the real or mock category service. See organizer.service.ts.

import { USE_MOCK_DATA } from "@/config/data-source";
import * as api from "@/services/api/category.service";
import * as mock from "@/services/mock/category.service";

export type { ApiCategory, Category, CategoryQuery } from "@/services/api/category.service";

const service: typeof api = USE_MOCK_DATA ? mock : api;

export const { getCategories, fetchCategories } = service;
