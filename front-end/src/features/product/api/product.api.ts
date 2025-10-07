// src/features/product/api/product.api.ts
import { Product } from "@/features/product/types";
import apiClient from "@/lib/apiClient";
import { buildQueryString } from "@/lib/queryString";
import { ProductFormValues } from "@/features/product/schemas";
import { handleImageUploads } from "@/features/upload/upload.api";

/**
 * Thêm một sản phẩm mới
 * @param productData Dữ liệu sản phẩm từ form
 */
export async function addProduct(
  productData: ProductFormValues
): Promise<Product> {
  const { images, ...otherData } = productData;
  const processedImages = await handleImageUploads(images); // <--- Sử dụng hàm dùng chung
  const payload = {
    ...otherData,
    images: processedImages,
  };
  return apiClient<Product>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Cập nhật thông tin một sản phẩm
 * @param productId ID của sản phẩm cần cập nhật
 * @param productData Dữ liệu cập nhật từ form
 */
export async function updateProduct({
  productId,
  productData,
}: {
  productId: string;
  productData: Partial<ProductFormValues>;
}): Promise<Product> {
  const { images, ...otherData } = productData;
  const processedImages = await handleImageUploads(images); // <--- Sử dụng hàm dùng chung
  const payload = {
    ...otherData,
    images: processedImages,
  };
  return apiClient<Product>(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Lấy danh sách tất cả sản phẩm
 */
export interface GetProductsParams {
  [key: string]: string | number | undefined;
  skip?: number;
  limit?: number;
  search?: string;
}

export async function getProducts(
  params?: GetProductsParams
): Promise<Product[]> {
  const query = buildQueryString(params);
  return apiClient<Product[]>(`/products${query}`);
}

/**
 * Lấy thông tin chi tiết một sản phẩm bằng ID
 * @param id ID của sản phẩm
 */
export async function getProductById(id: string): Promise<Product> {
  return apiClient<Product>(`/products/${id}`);
}

/**
 * Xóa (vô hiệu hóa) một sản phẩm
 * @param productId ID của sản phẩm cần xóa
 */
export async function deleteProduct(productId: string): Promise<void> {
  return apiClient<void>(`/products/${productId}`, {
    method: "DELETE",
  });
}
