import { Category, CategoryType } from "@/features/category/types";
import { CategoryFormValues } from "@/features/category/schemas";
import apiClient from "@/lib/apiClient";

/**
 * Lấy danh sách tất cả danh mục từ server
 */
export async function getCategories(type?: CategoryType): Promise<Category[]> {
  const endpoint = type
    ? `/catalog/categories?type=${type}`
    : "/catalog/categories";
  return await apiClient<Category[]>(endpoint);
}

/**
 * Thêm một danh mục mới
 * @param categoryData Dữ liệu của danh mục mới
 */
export async function addCategory(
  categoryData: CategoryFormValues
): Promise<Category> {
  return apiClient<Category>("catalog/categories", {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
}

/**
 * Cập nhật một danh mục
 * @param id ID của danh mục
 * @param categoryData Dữ liệu cập nhật
 */
export async function updateCategory({
  id,
  data,
}: {
  id: string;
  data: CategoryFormValues;
}): Promise<Category> {
  return apiClient<Category>(`catalog/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Xóa một danh mục
 * @param id ID của danh mục
 */
export async function deleteCategory(id: string): Promise<void> {
  return apiClient<void>(`catalog/categories/${id}`, {
    method: "DELETE",
  });
}
