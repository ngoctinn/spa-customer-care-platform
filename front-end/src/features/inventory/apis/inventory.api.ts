// src/features/inventory/api/inventory.api.ts
import apiClient from "@/lib/apiClient";
import { Product } from "@/features/product/types";
import { StockAdjustmentFormValues } from "@/features/product/schemas";
import {
  InventoryStats,
  InventoryTransaction,
} from "@/features/inventory/types";

/**
 * Điều chỉnh số lượng tồn kho của một sản phẩm.
 */
export async function adjustStock(
  payload: StockAdjustmentFormValues
): Promise<Product> {
  return apiClient<Product>(`/products/${payload.productId}/adjust-stock`, {
    method: "POST",
    body: JSON.stringify({
      quantity_change: payload.quantity, // Sửa 'quantity' thành 'quantity_change' để khớp với backend
      notes: payload.notes,
    }),
  });
}

/**
 * Lấy lịch sử giao dịch tồn kho của một sản phẩm.
 */
export async function getInventoryHistory(
  productId: string
): Promise<InventoryTransaction[]> {
  return apiClient<InventoryTransaction[]>(
    `/inventory/transactions/${productId}` // Thay đổi endpoint cho nhất quán
  );
}

/**
 * Lấy các chỉ số thống kê tổng quan về kho.
 */
export async function getInventoryStats(): Promise<InventoryStats> {
  // Đổi từ dữ liệu giả lập sang gọi API thật
  return apiClient<InventoryStats>("/inventory/stats");
}

/**
 * Lấy danh sách sản phẩm sắp hết hàng.
 */
export async function getLowStockProducts(): Promise<Product[]> {
  // Đổi từ dữ liệu giả lập sang gọi API thật
  return apiClient<Product[]>("/inventory/low-stock");
}

/**
 * Lấy các giao dịch kho gần đây.
 */
export async function getRecentTransactions(): Promise<InventoryTransaction[]> {
  // Đổi từ dữ liệu giả lập sang gọi API thật và dùng đúng kiểu dữ liệu
  return apiClient<InventoryTransaction[]>("/inventory/recent-transactions");
}
