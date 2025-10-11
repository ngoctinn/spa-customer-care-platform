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
