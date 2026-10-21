// Mirrors GET /categories → ApiCategory[].

import type { ApiCategory } from "@/services/api/category.service";
import { mockId } from "@/mocks/utils";

const CATEGORY_NAMES = [
  "Traditional",
  "Cultural",
  "Music",
  "Food",
  "Sport",
  "Technology",
  "Art",
  "Education",
  "Community",
  "Adventure",
  "Entertainment",
  "Charity",
] as const;

export type MockCategoryName = (typeof CATEGORY_NAMES)[number];

export const mockCategories: ApiCategory[] = CATEGORY_NAMES.map((name, i) => ({
  categoryId: mockId("8", i + 1),
  name,
}));

export function mockCategoryId(name: MockCategoryName): string {
  return mockCategories.find((c) => c.name === name)!.categoryId;
}

export function mockCategoryName(categoryId: string): string {
  return mockCategories.find((c) => c.categoryId === categoryId)?.name ?? "Other";
}
