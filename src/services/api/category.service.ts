// category.service.ts
// Fetches categories from backend for use in filter dropdowns

import { serverFetch } from "@/lib/server-fetch";
import { clientFetch } from "@/lib/client-fetch";
import { resolveCategoryKey } from "@/constant/category.config";
import { AppBaseCategoryType } from "@/types/common.type";

export interface ApiCategory {
  categoryId: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  configKey: AppBaseCategoryType;
}

export async function getCategories(): Promise<Category[]> {
  const response = await serverFetch("categories?page=1&size=100", {
    cache: "force-cache",
  } as RequestInit);
  const result = await response.json();

  if (!response.ok) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return [];
  }

  return (result.data.content as ApiCategory[]).map((cat) => ({
    id: cat.categoryId,
    name: cat.name,
    configKey: resolveCategoryKey(cat.name),
  }));
}

export interface CategoryQuery {
  search?: string;
  page?: number;
  size?: number;
}

/**
 * GET /api/v1/categories — raw ApiCategory list, callable from client
 * components too (getCategories above is server-only and cached).
 * Only the given params are sent, e.g. {} → "categories",
 * { page: 1, size: 100 } → "categories?page=1&size=100".
 */
export async function fetchCategories(
  params: CategoryQuery = {},
): Promise<ApiCategory[]> {
  const query = new URLSearchParams();
  if (params.search !== undefined) query.set("search", params.search);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  const qs = query.toString();
  const path = qs ? `categories?${qs}` : "categories";

  const res =
    typeof window === "undefined"
      ? await serverFetch(path)
      : await clientFetch(path);
  if (!res.ok) {
    throw new Error(`Failed to fetch categories [${res.status}]`);
  }

  const json = await res.json();
  const list = json.data?.content ?? json.data ?? json;
  return Array.isArray(list) ? (list as ApiCategory[]) : [];
}
