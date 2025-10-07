// src/features/inventory/types.ts

// Định nghĩa các loại giao dịch kho
export type StockAdjustmentType =
  | "initial" // Khởi tạo tồn kho ban đầu
  | "manual_adjustment" // Điều chỉnh thủ công (nhập/xuất)
  | "sale" // Bán hàng qua đơn hàng
  | "service_consumption" // Tiêu hao cho dịch vụ
  | "return" // Khách hàng trả lại
  | "inventory_check"; // Kiểm kho

export interface StockHistoryLog {
  id: string;
  product_id: string;
  user_id: string; // ID của nhân viên thực hiện
  user_name: string; // Tên nhân viên (để hiển thị)
  quantity_changed: number; // Số dương là nhập, số âm là xuất
  new_stock_level: number; // Số lượng tồn kho sau khi thay đổi
  type: StockAdjustmentType;
  notes?: string | null;
  related_invoice_id?: string | null;
  related_appointment_id?: string | null;
  created_at: string; // Giữ dạng string để dễ parse
}
