// src/features/category/hooks/useCategories.ts
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/features/category/api/category.api";
import { Category } from "@/features/category/types";

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
};
