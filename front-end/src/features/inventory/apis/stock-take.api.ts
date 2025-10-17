// src/features/inventory/apis/stock-take.api.ts
import apiClient from "@/lib/apiClient";
import { StockTakeSession } from "@/features/inventory/types";

/**
 * Lấy danh sách tất cả các phiên kiểm kê.
 */
export async function getStockTakes(): Promise<StockTakeSession[]> {
  return apiClient<StockTakeSession[]>("/inventory/stock-takes");
}

/**
 * Tạo một phiên kiểm kê mới.
 */
export async function createStockTake(): Promise<StockTakeSession> {
  return apiClient<StockTakeSession>("/inventory/stock-takes", {
    method: "POST",
  });
}

/**
 * Lấy chi tiết một phiên kiểm kê bằng ID.
 */
export async function getStockTakeById(id: string): Promise<StockTakeSession> {
  return apiClient<StockTakeSession>(`/inventory/stock-takes/${id}`);
}

/**
 * Cập nhật số lượng đếm thực tế cho các sản phẩm.
 */
export async function updateStockTakeItems(
  sessionId: string,
  items: { product_id: string; actual_quantity: number }[]
): Promise<void> {
  return apiClient<void>(`/inventory/stock-takes/${sessionId}/items`, {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}

/**
 * Hoàn tất một phiên kiểm kê và tạo các phiếu điều chỉnh tự động.
 */
export async function completeStockTake(sessionId: string): Promise<void> {
  return apiClient<void>(`/inventory/stock-takes/${sessionId}/complete`, {
    method: "POST",
  });
}
