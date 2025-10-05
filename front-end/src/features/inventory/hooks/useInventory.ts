// src/features/inventory/hooks/useInventory.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adjustStock } from "@/features/inventory/api/inventory.api";
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
