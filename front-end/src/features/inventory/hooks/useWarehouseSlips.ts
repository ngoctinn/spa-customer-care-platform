// src/features/inventory/hooks/useWarehouseSlips.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getWarehouseSlips,
  createWarehouseSlip,
} from "@/features/inventory/apis/warehouse-slip.api";
import {
  ImportSlipFormValues,
  ExportSlipFormValues,
} from "@/features/inventory/schemas/warehouse-slip.schema";
import { WarehouseSlip } from "@/features/inventory/types";
import { deleteWarehouseSlip } from "@/features/inventory/apis/warehouse-slip.api";

const queryKey = ["warehouseSlips"];

export const useWarehouseSlips = () => {
  return useQuery<WarehouseSlip[]>({
    queryKey,
    queryFn: getWarehouseSlips,
  });
};

export const useWarehouseSlipMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (
      slipData: (ImportSlipFormValues | ExportSlipFormValues) & {
        type: "IMPORT" | "EXPORT";
      }
    ) => createWarehouseSlip(slipData),
    onSuccess: () => {
      toast.success("Tạo phiếu kho thành công!");
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryHistory"] });
    },
    onError: (error) => {
      toast.error("Tạo phiếu kho thất bại", {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (slipId: string) => deleteWarehouseSlip(slipId),
    onSuccess: () => {
      toast.success("Xóa phiếu kho thành công!");
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryHistory"] });
    },
    onError: (error) => {
      toast.error("Xóa phiếu kho thất bại", {
        description: error.message,
      });
    },
  });

  return { createMutation, deleteMutation };
};
