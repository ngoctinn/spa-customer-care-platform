// src/features/category/hooks/useCategoryManagement.ts
import { useResourceManagement } from "@/features/management-pages/hooks/useResourceManagement";
import { useCategories } from "./useCategories";
import { Category } from "../types";
import { CategoryFormValues, categoryFormSchema } from "../schemas";
import {
  addCategory,
  updateCategory,
  deleteCategory,
} from "../api/category.api";

export function useCategoryManagement() {
  return useResourceManagement<Category, CategoryFormValues>({
    queryKey: ["categories"],
    useDataHook: useCategories,
    addFn: addCategory,
    updateFn: updateCategory,
    deleteFn: deleteCategory,
    formSchema: categoryFormSchema,
    defaultFormValues: {
      name: "",
      description: "",
      category_type: "service",
    },
    getEditFormValues: (category) => ({
      ...category,
      description: category.description ?? "",
    }),
    customMessages: {
      addSuccess: "Thêm danh mục thành công!",
      updateSuccess: "Cập nhật danh mục thành công!",
      deleteSuccess: "Đã xóa danh mục!",
    },
  });
}
