"use client";

import { useState, useEffect } from "react";
import { Category, fetchCategories } from "@/services/category.service";
import { resolveCategoryKey } from "@/constant/category.config";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories({ page: 1, size: 100 })
      .then((list) => {
        setCategories(
          list.map((cat) => ({
            id: cat.categoryId,
            name: cat.name,
            configKey: resolveCategoryKey(cat.name),
          })),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
