// Mock implementation of services/api/category.service.ts.

import type { ApiCategory, Category, CategoryQuery } from "@/services/api/category.service";
import { resolveCategoryKey } from "@/constant/category.config";
import { mockCategories } from "@/mocks/categories.mock";
import { clone, mockRequest, offsetPage } from "@/mocks/utils";

export async function getCategories(): Promise<Category[]> {
  await mockRequest("category.list", 0);
  return mockCategories.map((cat) => ({
    id: cat.categoryId,
    name: cat.name,
    configKey: resolveCategoryKey(cat.name),
  }));
}

export async function fetchCategories(params: CategoryQuery = {}): Promise<ApiCategory[]> {
  await mockRequest("category.list", 0);
  const term = params.search?.trim().toLowerCase();
  const matches = term
    ? mockCategories.filter((c) => c.name.toLowerCase().includes(term))
    : mockCategories;
  if (params.page === undefined && params.size === undefined) return clone(matches);
  return clone(offsetPage(matches, params.page ?? 1, params.size ?? 10).content);
}
