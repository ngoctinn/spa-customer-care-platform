import { Product } from "@/features/product/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Lấy danh sách tất cả sản phẩm
 */
export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) {
    throw new Error("Không thể tải danh sách sản phẩm");
  }
  return response.json();
}

/**
 * Lấy thông tin chi tiết một sản phẩm bằng ID
 * @param id ID của sản phẩm
 */
export async function getProductById(id: string): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Sản phẩm không được tìm thấy.");
    }
    throw new Error("Không thể tải thông tin sản phẩm");
  }
  return response.json();
}
