// src/features/inventory/hooks/useWarehouseSlips.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getWarehouseSlips,
  getWarehouseSlipById,
  createWarehouseSlip,
  updateWarehouseSlip,
  deleteWarehouseSlip,
} from "@/features/inventory/apis/warehouse-slip.api";
import {
  ImportSlipFormValues,
  ExportSlipFormValues,
} from "@/features/inventory/schemas/warehouse-slip.schema";
import { WarehouseSlip } from "@/features/inventory/types";

const queryKey = ["warehouseSlips"];

export const useWarehouseSlips = (params?: {
  supplierId?: string;
  type?: "IMPORT" | "EXPORT";
}) => {
  return useQuery<WarehouseSlip[]>({ 
    queryKey: [...queryKey, params], 
    queryFn: () => getWarehouseSlips(params), 
  });
};

/**
 * Hook để lấy thông tin chi tiết một phiếu kho bằng ID
 * @param id ID của phiếu kho
 */
export const useWarehouseSlipById = (id: string | null) => {
  return useQuery<WarehouseSlip | null>({
    queryKey: [...queryKey, id],
    queryFn: () => (id ? getWarehouseSlipById(id) : null),
    enabled: !!id, // Chỉ fetch khi có id
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

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      slipData,
    }: {
      id: string;
      slipData: (ImportSlipFormValues | ExportSlipFormValues) & {
        type: "IMPORT" | "EXPORT";
      };
    }) => updateWarehouseSlip(id, slipData),
    onSuccess: () => {
      toast.success("Cập nhật phiếu kho thành công!");
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryHistory"] });
    },
    onError: (error) => {
      toast.error("Cập nhật phiếu kho thất bại", {
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

  return { createMutation, updateMutation, deleteMutation };
};
