// src/features/product/api/product.api.ts
import { ProductFormValues } from "@/features/product/schemas";
import { Product } from "@/features/product/types";
import apiClient from "@/lib/apiClient";
import { buildQueryString } from "@/lib/queryString";
import {
  appendFormDataList,
  appendFormDataValue,
  splitImages,
} from "@/lib/form-data-utils";

function buildProductFormData(
  productData: Partial<ProductFormValues>
): FormData {
  const formData = new FormData();

  appendFormDataValue(formData, "name", productData.name);
  appendFormDataValue(formData, "description", productData.description);
  appendFormDataValue(formData, "price", productData.price);
  appendFormDataValue(formData, "stock", productData.stock);
  appendFormDataValue(formData, "is_retail", productData.isRetail);
  appendFormDataValue(formData, "is_consumable", productData.isConsumable);
  appendFormDataValue(formData, "base_unit", productData.baseUnit);
  appendFormDataValue(
    formData,
    "consumable_unit",
    productData.consumableUnit
  );
  appendFormDataValue(
    formData,
    "conversion_rate",
    productData.conversionRate
  );

  if (productData.categories) {
    appendFormDataList(formData, "category_ids", productData.categories);
  }

  if (productData.primary_image_id) {
    appendFormDataValue(
      formData,
      "primary_image_id",
      productData.primary_image_id
    );
  }

  if (productData.images) {
    const { files, existingIds } = splitImages(productData.images);
    if (existingIds.length > 0) {
      appendFormDataList(formData, "existing_image_ids", existingIds);
    }
    files.forEach((file) => {
      formData.append("images", file);
    });
  }

  return formData;
}

/**
 * Thêm một sản phẩm mới
 * @param productData Dữ liệu sản phẩm từ form
 */
export async function addProduct(
  productData: ProductFormValues
): Promise<Product> {
  const formData = buildProductFormData(productData);
  return apiClient<Product>("/products", {
    method: "POST",
    body: formData,
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
  const formData = buildProductFormData(productData);
  return apiClient<Product>(`/products/${productId}`, {
    method: "PUT",
    body: formData,
  });
}

/**
 * Lấy danh sách tất cả sản phẩm
 */
export type GetProductsParams = {
  skip?: number;
  limit?: number;
  search?: string;
};

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
