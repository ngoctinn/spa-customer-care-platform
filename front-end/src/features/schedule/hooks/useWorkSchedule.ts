// src/features/schedule/hooks/useWorkSchedule.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getWorkSchedule, updateWorkSchedule } from "../api/schedule.api";
import type { WorkSchedule } from "../types";
import { getErrorMessage } from "@/lib/get-error-message";

const workScheduleQueryKeys = {
  detail: (staffId: string) => ["workSchedule", staffId] as const,
};

export const useWorkSchedule = (staffId: string) => {
  return useQuery<WorkSchedule>({
    queryKey: workScheduleQueryKeys.detail(staffId),
    queryFn: () => getWorkSchedule(staffId),
  });
};

export const useUpdateWorkSchedule = (staffId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    WorkSchedule,
    unknown,
    Partial<WorkSchedule>
  >({
    mutationFn: (data) => updateWorkSchedule(staffId, data),
    onSuccess: async () => {
      toast.success("Cập nhật lịch làm việc thành công!");
      await queryClient.invalidateQueries({
        queryKey: workScheduleQueryKeys.detail(staffId),
      });
    },
    onError: (error) => {
      toast.error("Cập nhật thất bại", {
        description: getErrorMessage(error),
      });
    },
  });
};
