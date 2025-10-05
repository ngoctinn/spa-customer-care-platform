// src/features/schedule/hooks/useWorkSchedule.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkSchedule, updateWorkSchedule } from "../api/schedule.api";
import { toast } from "sonner";
import { WorkSchedule } from "../types";

const getQueryKey = (staffId: string) => ["workSchedule", staffId];

export const useWorkSchedule = (staffId: string) => {
  return useQuery<WorkSchedule>({
    queryKey: getQueryKey(staffId),
    queryFn: () => getWorkSchedule(staffId),
  });
};

export const useUpdateWorkSchedule = (staffId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<WorkSchedule>) =>
      updateWorkSchedule(staffId, data),
    onSuccess: () => {
      toast.success("Cập nhật lịch làm việc thành công!");
      queryClient.invalidateQueries({ queryKey: getQueryKey(staffId) });
    },
    onError: (error) => {
      toast.error("Cập nhật thất bại", { description: error.message });
    },
  });
};
