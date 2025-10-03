import { Category } from "@/features/category/types";
import { CategoryFormValues } from "@/features/category/schemas";
import apiClient from "@/lib/apiClient";

/**
 * Lấy danh sách tất cả danh mục từ server
 */
export async function getCategories(): Promise<Category[]> {
  return apiClient<Category[]>("/categories");
}

/**
 * Thêm một danh mục mới
 * @param categoryData Dữ liệu của danh mục mới
 */
export async function addCategory(
  categoryData: CategoryFormValues
): Promise<Category> {
  return apiClient<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
}
