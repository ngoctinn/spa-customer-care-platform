// src/features/inventory/api/inventory.api.ts
import apiClient from "@/lib/apiClient";
import { Product } from "@/features/product/types";
import { StockAdjustmentFormValues } from "@/features/product/schemas";

/**
 * Điều chỉnh số lượng tồn kho của một sản phẩm.
 * Backend sẽ xử lý logic dựa trên quantity là số dương (nhập) hay âm (xuất).
 * @param payload Dữ liệu điều chỉnh tồn kho, bao gồm productId và quantity.
 * @returns Thông tin sản phẩm đã được cập nhật.
 */
export async function adjustStock(
  payload: StockAdjustmentFormValues
): Promise<Product> {
  // Giả sử endpoint là /products/{productId}/adjust-stock
  // Backend sẽ lấy productId từ payload
  return apiClient<Product>(`/products/${payload.productId}/adjust-stock`, {
    method: "POST",
    // Chỉ gửi những gì cần thiết cho backend
    body: JSON.stringify({
      quantity: payload.quantity,
      notes: payload.notes,
    }),
  });
}
