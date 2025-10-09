import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/features/category/api/category.api";
import { Category, CategoryType } from "@/features/category/types";

export const useCategories = (type?: CategoryType) => {
  return useQuery<Category[]>({
    queryKey: ["categories", type],
    queryFn: () => getCategories(type),
  });
};
