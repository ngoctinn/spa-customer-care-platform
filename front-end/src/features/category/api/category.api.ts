import { Category } from "@/features/category/types";
import { CategoryFormValues } from "@/features/category/schemas";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Lấy danh sách tất cả danh mục từ server
 */
export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) {
    throw new Error("Không thể tải danh sách danh mục");
  }
  return response.json();
}

/**
 * Thêm một danh mục mới
 * @param categoryData Dữ liệu của danh mục mới
 */
export async function addCategory(
  categoryData: CategoryFormValues
): Promise<Category> {
  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Thêm danh mục thất bại");
  }
  return response.json();
}
