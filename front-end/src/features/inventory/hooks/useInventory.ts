// src/features/inventory/hooks/useInventory.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adjustStock } from "@/features/inventory/api/inventory.api";
import { productsQueryKeys } from "@/features/product/hooks/useProducts";
import type { StockAdjustmentFormValues } from "@/features/product/schemas";
import type { Product } from "@/features/product/types";
import { getErrorMessage } from "@/lib/get-error-message";

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
