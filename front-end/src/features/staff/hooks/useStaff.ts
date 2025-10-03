// src/features/staff/hooks/useStaff.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStaffList,
  addStaff,
  updateStaff,
  deleteStaff,
} from "@/features/staff/api/staff.api";
import { FullStaffProfile } from "@/features/staff/types";
import { toast } from "sonner";

const queryKey = ["staffList"];

export const useStaff = () => {
  return useQuery<FullStaffProfile[]>({
    queryKey: queryKey,
    queryFn: getStaffList,
  });
};

export const useAddStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addStaff,
    onSuccess: () => {
      toast.success("Thêm nhân viên thành công!");
      // Làm mới lại danh sách nhân viên
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error) => {
      toast.error("Thêm nhân viên thất bại", {
        description: error.message,
      });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStaff,
    onSuccess: () => {
      toast.success("Cập nhật thông tin thành công!");
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error) => {
      toast.error("Cập nhật thất bại", {
        description: error.message,
      });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      toast.success("Đã xóa nhân viên!");
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error) => {
      toast.error("Xóa thất bại", {
        description: error.message,
      });
    },
  });
};
