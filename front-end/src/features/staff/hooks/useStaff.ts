// src/features/staff/hooks/useStaff.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStaffList,
  addStaff,
  updateStaff,
  deleteStaff,
  getStaffById,
  getTechniciansByService,
} from "@/features/staff/api/staff.api";
import { FullStaffProfile } from "@/features/staff/types";
import { useCrudMutations } from "@/hooks/useCrudMutations";
import { UserPublic } from "@/features/user/types";
import { StaffFormValues } from "@/features/staff/schemas";

const queryKey = ["staffList"];

export const useStaff = () => {
  return useQuery<FullStaffProfile[]>({
    queryKey: queryKey,
    queryFn: getStaffList,
  });
};

export const useStaffMutations = () => {
  return useCrudMutations<
    FullStaffProfile,
    StaffFormValues,
    Partial<StaffFormValues>
  >(
    queryKey,
    addStaff,
    (vars: { id: string; data: Partial<StaffFormValues> }) =>
      updateStaff({ staffId: vars.id, staffData: vars.data }),
    deleteStaff,
    {
      addSuccess: "Thêm nhân viên thành công!",
      updateSuccess: "Cập nhật thông tin nhân viên thành công!",
      deleteSuccess: "Đã xóa nhân viên!",
    }
  );
};

export const useStaffById = (staffId: string) => {
  return useQuery<FullStaffProfile>({
    queryKey: ["staff", staffId],
    queryFn: () => getStaffById(staffId),
    enabled: !!staffId, // Chỉ chạy khi có staffId
  });
};

export const useTechniciansByService = (serviceId?: string) => {
  return useQuery<FullStaffProfile[]>({
    queryKey: ["technicians", serviceId],
    queryFn: () => getTechniciansByService(serviceId!),
    enabled: !!serviceId,
  });
};
