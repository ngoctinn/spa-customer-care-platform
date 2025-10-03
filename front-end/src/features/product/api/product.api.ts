import { Product } from "@/features/product/types";
import apiClient from "@/lib/apiClient";

/**
 * Lấy danh sách tất cả sản phẩm
 */
export async function getProducts(): Promise<Product[]> {
  return apiClient<Product[]>("/products");
}

/**
 * Lấy thông tin chi tiết một sản phẩm bằng ID
 * @param id ID của sản phẩm
 */
export async function getProductById(id: string): Promise<Product> {
  return apiClient<Product>(`/products/${id}`);
}
