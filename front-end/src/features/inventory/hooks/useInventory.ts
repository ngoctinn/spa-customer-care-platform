// src/features/inventory/hooks/useInventory.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  adjustStock,
  getStockHistory,
} from "@/features/inventory/api/inventory.api";
import { productsQueryKeys } from "@/features/product/hooks/useProducts";
import type { StockAdjustmentFormValues } from "@/features/product/schemas";
import type { Product } from "@/features/product/types";
import { getErrorMessage } from "@/lib/get-error-message";
import { StockHistoryLog } from "@/features/inventory/types";
export const inventoryQueryKeys = {
  history: (productId: string) => ["inventoryHistory", productId] as const,
};
export const useAdjustStock = () => {
  const queryClient = useQueryClient();

  return useMutation<Product, unknown, StockAdjustmentFormValues>({
    mutationFn: adjustStock,
    onSuccess: async (updatedProduct) => {
      toast.success(
        `Đã cập nhật tồn kho cho "${updatedProduct.name}" thành công!`
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productsQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: productsQueryKeys.detail(updatedProduct.id),
        }),
      ]);
    },
    onError: (error) => {
      toast.error("Cập nhật tồn kho thất bại", {
        description: getErrorMessage(error),
      });
    },
  });
};

export const useStockHistory = (productId: string | null) => {
  return useQuery<StockHistoryLog[]>({
    queryKey: inventoryQueryKeys.history(productId!),
    queryFn: () => getStockHistory(productId!),
    enabled: !!productId, // Chỉ chạy query khi có productId
  });
};
