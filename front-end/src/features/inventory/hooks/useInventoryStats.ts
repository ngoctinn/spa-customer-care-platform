// src/features/inventory/hooks/useInventoryStats.ts
import { useQuery } from "@tanstack/react-query";
import { getInventoryStats } from "@/features/inventory/apis/inventory.api"; // Giả sử API function đã được tạo

// Giả định kiểu trả về của API stats
interface InventoryStats {
  totalValue: number;
  lowStockCount: number;
  supplierCount: number;
}

export const useInventoryStats = () => {
  return useQuery<InventoryStats>({
    queryKey: ["inventoryStats"],
    queryFn: getInventoryStats,
  });
};
