// src/features/inventory/hooks/useStockTakes.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getStockTakes,
  createStockTake,
  getStockTakeById,
  updateStockTakeItems,
  completeStockTake,
} from "@/features/inventory/apis/stock-take.api";
import { StockTakeSession } from "../types";

const queryKey = ["stockTakes"];

export const useStockTakes = () => {
  return useQuery<StockTakeSession[]>({
    queryKey,
    queryFn: getStockTakes,
  });
};

export const useStockTakeById = (sessionId: string) => {
  return useQuery<StockTakeSession>({
    queryKey: [...queryKey, sessionId],
    queryFn: () => getStockTakeById(sessionId),
    enabled: !!sessionId,
  });
};

export const useStockTakeMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createStockTake,
    onSuccess: () => {
      toast.success("Đã tạo phiên kiểm kê mới!");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error("Tạo phiên thất bại", { description: error.message });
    },
  });

  const updateItemsMutation = useMutation({
    mutationFn: ({
      sessionId,
      items,
    }: {
      sessionId: string;
      items: { product_id: string; actual_quantity: number }[];
    }) => updateStockTakeItems(sessionId, items),
    onSuccess: (_, { sessionId }) => {
      toast.success("Đã cập nhật số lượng.");
      queryClient.invalidateQueries({ queryKey: [...queryKey, sessionId] });
    },
    onError: (error) => {
      toast.error("Cập nhật thất bại", { description: error.message });
    },
  });

  const completeMutation = useMutation({
    mutationFn: completeStockTake,
    onSuccess: (_, sessionId) => {
      toast.success("Hoàn tất kiểm kê và đã tạo phiếu điều chỉnh!");
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: [...queryKey, sessionId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryHistory"] });
    },
    onError: (error) => {
      toast.error("Không thể hoàn tất", { description: error.message });
    },
  });

  return {
    createMutation,
    updateItemsMutation,
    completeMutation,
  };
};
