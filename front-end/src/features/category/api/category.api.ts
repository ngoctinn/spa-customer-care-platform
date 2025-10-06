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

/**
 * Cập nhật một danh mục
 * @param categoryId ID của danh mục cần cập nhật
 * @param categoryData Dữ liệu cập nhật
 */
export async function updateCategory({
  categoryId,
  categoryData,
}: {
  categoryId: string;
  categoryData: Partial<CategoryFormValues>;
}): Promise<Category> {
  return apiClient<Category>(`/categories/${categoryId}`, {
    method: "PUT",
    body: JSON.stringify(categoryData),
  });
}

/**
 * Xóa một danh mục
 * @param categoryId ID của danh mục cần xóa
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  return apiClient<void>(`/categories/${categoryId}`, {
    method: "DELETE",
  });
}
