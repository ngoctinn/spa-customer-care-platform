// src/features/staff/hooks/useStaff.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getStaffList,
  addStaff,
  updateStaff,
  deleteStaff,
  getStaffById,
  getTechniciansByService,
} from "@/features/staff/api/staff.api";
import type { StaffFormValues } from "@/features/staff/schemas";
import type { FullStaffProfile } from "@/features/staff/types";
import type { UserPublic } from "@/features/user/types";
import { getErrorMessage } from "@/lib/get-error-message";

export const staffQueryKeys = {
  all: ["staff"] as const,
  detail: (staffId: string | undefined) => ["staff", staffId] as const,
  techniciansByService: (serviceId?: string) =>
    ["technicians", serviceId] as const,
};

export const useStaff = () => {
  return useQuery<FullStaffProfile[]>({
    queryKey: staffQueryKeys.all,
    queryFn: () => getStaffList(),
  });
};

export const useAddStaff = () => {
  const queryClient = useQueryClient();

  return useMutation<UserPublic, unknown, StaffFormValues>({
    mutationFn: addStaff,
    onSuccess: async (createdStaff) => {
      toast.success("Thêm nhân viên thành công!");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: staffQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: staffQueryKeys.detail(createdStaff.id),
        }),
      ]);
    },
    onError: (error) => {
      toast.error("Thêm nhân viên thất bại", {
        description: getErrorMessage(error),
      });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation<UserPublic, unknown, Parameters<typeof updateStaff>[0]>({
    mutationFn: updateStaff,
    onSuccess: async (_, variables) => {
      toast.success("Cập nhật thông tin thành công!");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: staffQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: staffQueryKeys.detail(variables.staffId),
        }),
      ]);
    },
    onError: (error) => {
      toast.error("Cập nhật thất bại", {
        description: getErrorMessage(error),
      });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: deleteStaff,
    onSuccess: async (_, staffId) => {
      toast.success("Đã xóa nhân viên!");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: staffQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: staffQueryKeys.detail(staffId),
        }),
      ]);
    },
    onError: (error) => {
      toast.error("Xóa thất bại", {
        description: getErrorMessage(error),
      });
    },
  });
};

export const useStaffById = (staffId: string | undefined) => {
  return useQuery<FullStaffProfile>({
    queryKey: staffQueryKeys.detail(staffId),
    queryFn: () => getStaffById(staffId as string),
    enabled: Boolean(staffId),
  });
};

export const useTechniciansByService = (serviceId?: string) => {
  return useQuery<FullStaffProfile[]>({
    queryKey: staffQueryKeys.techniciansByService(serviceId),
    queryFn: () => getTechniciansByService(serviceId as string),
    enabled: Boolean(serviceId),
  });
};
