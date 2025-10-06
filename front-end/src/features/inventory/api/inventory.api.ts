// src/features/inventory/api/inventory.api.ts
import apiClient from "@/lib/apiClient";
import { Product } from "@/features/product/types";
import { StockAdjustmentFormValues } from "@/features/product/schemas";
import { StockHistoryLog } from "@/features/inventory/types"; // <-- Import type mới

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
 * Lấy lịch sử thay đổi tồn kho của một sản phẩm.
 * @param productId ID của sản phẩm.
 * @returns Danh sách các bản ghi lịch sử.
 */
export async function getStockHistory(
  productId: string
): Promise<StockHistoryLog[]> {
  // Giả sử endpoint là /inventory/history/{productId}
  // Vì chưa có backend thật, chúng ta sẽ trả về dữ liệu giả lập
  console.log(`Fetching stock history for product: ${productId}`);
  return Promise.resolve([
    {
      id: "hist_1",
      product_id: productId,
      user_id: "user_1",
      user_name: "Admin",
      quantity_changed: 100,
      new_stock_level: 100,
      type: "initial",
      notes: "Khởi tạo tồn kho ban đầu",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "hist_2",
      product_id: productId,
      user_id: "user_2",
      user_name: "Lê Ngọc Châu",
      quantity_changed: -5,
      new_stock_level: 95,
      type: "service_consumption",
      notes: "Dịch vụ Chăm sóc da mặt cho KH Nguyễn Thị An",
      related_appointment_id: "appt_abc",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "hist_3",
      product_id: productId,
      user_id: "user_1",
      user_name: "Admin",
      quantity_changed: 50,
      new_stock_level: 145,
      type: "manual_adjustment",
      notes: "Nhập hàng từ NCC Beauty Supply",
      created_at: new Date().toISOString(),
    },
  ]);
}
