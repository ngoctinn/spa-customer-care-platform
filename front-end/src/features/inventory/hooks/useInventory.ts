// src/features/inventory/hooks/useInventory.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adjustStock,
  getInventoryHistory,
} from "@/features/inventory/apis/inventory.api";
import { StockAdjustmentFormValues } from "@/features/product/schemas";

export const useAdjustStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StockAdjustmentFormValues) => adjustStock(payload),
    onSuccess: (updatedProduct) => {
      toast.success(
        `Đã cập nhật tồn kho cho "${updatedProduct.name}" thành công!`
      );
      // Làm mới lại danh sách sản phẩm để UI cập nhật
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      toast.error("Cập nhật tồn kho thất bại", {
        description: error.message,
      });
    },
  });
};

export const useInventoryHistory = (productId: string) => {
  return useQuery({
    queryKey: ["inventoryHistory", productId],
    queryFn: () => getInventoryHistory(productId),
    enabled: !!productId, // Chỉ chạy khi có productId
  });
};
