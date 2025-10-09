// src/features/inventory/types.ts
import { User } from "@/features/user/types";

export interface InventoryTransaction {
  id: string;
  product_id: string;
  quantity_change: number;
  new_stock_level: number;
  notes?: string;
  created_by: User; // Hoặc chỉ là created_by_id: string;
  created_at: string;
}
