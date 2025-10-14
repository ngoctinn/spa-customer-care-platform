// src/features/category/api/category.api.ts
import { Category, CategoryType } from "@/features/category/types";
import { CategoryFormValues } from "@/features/category/schemas";
import apiClient from "@/lib/apiClient";

/**
 * Lấy danh sách danh mục theo loại.
 */
export async function getCategories(type?: CategoryType): Promise<Category[]> {
  const endpoint = type
    ? `/catalog/categories?type=${type}`
    : "/catalog/categories";
  return await apiClient<Category[]>(endpoint);
}

/**
 * Lấy thông tin chi tiết một danh mục bằng ID.
 */
export async function getCategoryById(id: string): Promise<Category> {
  return apiClient<Category>(`/catalog/categories/${id}`);
}

/**
 * Thêm một danh mục mới.
 */
export async function addCategory(
  categoryData: CategoryFormValues
): Promise<Category> {
  return apiClient<Category>("/catalog/categories", {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
}

/**
 * Cập nhật một danh mục.
 */
export async function updateCategory({
  id,
  data,
}: {
  id: string;
  data: Partial<CategoryFormValues>;
}): Promise<Category> {
  // API chỉ cho phép cập nhật name và description
  const payload = {
    name: data.name,
    description: data.description,
  };
  return apiClient<Category>(`/catalog/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Xóa một danh mục.
 */
export async function deleteCategory(id: string): Promise<void> {
  return apiClient<void>(`/catalog/categories/${id}`, {
    method: "DELETE",
  });
}
