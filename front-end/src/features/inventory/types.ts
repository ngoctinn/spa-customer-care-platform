// src/features/inventory/types.ts
import { User } from "@/features/user/types";

/**
 * @description Đại diện cho thông tin của một Nhà Cung Cấp.
 */
export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email?: string;
  address?: string;
}

/**
 * @description Enum cho loại phiếu kho (Nhập hoặc Xuất).
 */
export type WarehouseSlipType = "IMPORT" | "EXPORT";

/**
 * @description Enum cho lý do xuất kho.
 */
export type WarehouseSlipReason =
  | "INTERNAL_USE"
  | "DAMAGED_GOODS"
  | "TRANSFER"
  | "OTHER";

/**
 * @description Đại diện cho một dòng sản phẩm trong phiếu kho.
 */
export interface SlipItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price?: number; // Bắt buộc cho phiếu nhập, không có cho phiếu xuất
}

/**
 * @description Đại diện cho một Phiếu Nhập hoặc Xuất Kho.
 */
export interface WarehouseSlip {
  id: string;
  code: string; // Mã phiếu tự động tạo, ví dụ: PNK20251026001
  type: WarehouseSlipType;
  reason?: WarehouseSlipReason; // Trường mới: Lý do xuất kho
  created_at: string; // ISO 8601 date string
  user: User; // Thông tin người tạo phiếu
  supplier?: Supplier; // Thông tin nhà cung cấp (chỉ cho phiếu nhập)
  items: SlipItem[];
  total_amount?: number; // Tổng giá trị phiếu, chỉ có ở phiếu nhập
  notes?: string;
}

/**
 * @description Giao dịch tồn kho (nhập, xuất, điều chỉnh).
 */
export interface InventoryTransaction {
  id: string;
  product_id: string;
  product_name: string; // Thêm tên sản phẩm để hiển thị
  quantity_change: number;
  new_stock_level: number;
  type: "IMPORT" | "EXPORT" | "ADJUSTMENT" | "SALE"; // Thêm loại giao dịch
  notes?: string;
  created_by: User;
  created_at: string;
}

/**
 * @description Kiểu dữ liệu cho các chỉ số thống kê kho.
 */
export interface InventoryStats {
  totalValue: number;
  lowStockCount: number;
  supplierCount: number;
}

/**
 * @description Trạng thái của một phiên kiểm kê kho.
 */
export type StockTakeStatus = "ongoing" | "completed";

/**
 * @description Chi tiết một sản phẩm trong phiên kiểm kê.
 */
export interface StockTakeItem {
  id: string;
  product_id: string;
  product_name: string;
  system_quantity: number;
  actual_quantity: number | null;
  variance: number;
}

/**
 * @description Một phiên kiểm kê kho.
 */
export interface StockTakeSession {
  id: string;
  code: string;
  status: StockTakeStatus;
  created_by: User;
  completed_at: string | null;
  created_at: string;
  items?: StockTakeItem[]; // Chi tiết các sản phẩm, chỉ có khi gọi API lấy chi tiết
}
