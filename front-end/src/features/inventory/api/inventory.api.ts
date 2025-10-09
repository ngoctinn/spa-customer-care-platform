// src/features/inventory/api/inventory.api.ts
import apiClient from "@/lib/apiClient";
import { Product } from "@/features/product/types";
import { StockAdjustmentFormValues } from "@/features/product/schemas";
import { InventoryTransaction } from "@/features/inventory/types";

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

/**
 * Lấy lịch sử giao dịch tồn kho của một sản phẩm.
 * @param productId ID của sản phẩm.
 * @returns Danh sách các giao dịch tồn kho.
 */
export async function getInventoryHistory(
  productId: string
): Promise<InventoryTransaction[]> {
  return apiClient<InventoryTransaction[]>(
    `/products/${productId}/inventory-history`
  );
}
