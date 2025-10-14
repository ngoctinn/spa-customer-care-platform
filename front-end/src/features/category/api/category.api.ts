// src/features/category/api/category.api.ts
import { Category, CategoryType } from "@/features/category/types";
import { CategoryFormValues } from "@/features/category/schemas";
import apiClient from "@/lib/apiClient";

/**
 * Lấy danh sách tất cả danh mục từ server.
 * Endpoint này đã chính xác.
 */
export async function getCategories(type?: CategoryType): Promise<Category[]> {
  const endpoint = type
    ? `/catalog/categories?type=${type}`
    : "/catalog/categories";
  return await apiClient<Category[]>(endpoint);
}

/**
 * THÊM MỚI: Lấy thông tin chi tiết một danh mục bằng ID.
 * @param id ID của danh mục
 */
export async function getCategoryById(id: string): Promise<Category> {
  return apiClient<Category>(`/catalog/categories/${id}`);
}


/**
 * Thêm một danh mục mới.
 * Endpoint và cấu trúc body đã chính xác.
 * @param categoryData Dữ liệu của danh mục mới
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
 * CẬP NHẬT: Cập nhật một danh mục.
 * API chỉ cho phép cập nhật 'name' và 'description'.
 * Chúng ta sẽ lọc payload trước khi gửi đi.
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
  // Chỉ gửi những trường mà API cho phép cập nhật
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
 * Endpoint đã chính xác.
 * @param id ID của danh mục
 */
export async function deleteCategory(id: string): Promise<void> {
  return apiClient<void>(`/catalog/categories/${id}`, {
    method: "DELETE",
  });
}