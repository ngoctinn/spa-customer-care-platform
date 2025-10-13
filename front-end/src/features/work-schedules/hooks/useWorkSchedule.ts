// src/features/schedule/hooks/useWorkSchedule.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkSchedule, updateWorkSchedule } from "../api/schedule.api";
import { toast } from "sonner";
import {
  DefaultSchedulePublic,
  DefaultScheduleUpdate,
  WorkSchedule,
} from "../types";

const getQueryKey = (staffId: string) => ["workSchedule", staffId];

export const useWorkSchedule = (staffId: string) => {
  return useQuery<DefaultSchedulePublic[]>({
    queryKey: getQueryKey(staffId),
    queryFn: () => getWorkSchedule(staffId),
    enabled: !!staffId, // Chỉ chạy khi có staffId
  });
};

export const useUpdateWorkSchedule = (staffId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    // Mutation function giờ nhận vào payload có dạng { schedules: [...] }
    mutationFn: (data: DefaultScheduleUpdate) =>
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
