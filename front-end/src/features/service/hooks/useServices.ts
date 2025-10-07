import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getServices,
  addService,
  updateService,
  deleteService,
} from "@/features/service/api/service.api";
import { Service } from "@/features/service/types";
import { toast } from "sonner";

const queryKey = ["services"];

// Hook để lấy danh sách dịch vụ
export const useServices = () => {
  const { data, isLoading, isError, error } = useQuery<Service[]>({
    queryKey: queryKey,
    queryFn: () => getServices(),
  });
  return { data, isLoading, isError, error };
};

// Hook để thêm dịch vụ mới
export const useAddService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addService,
    onSuccess: () => {
      toast.success("Thêm dịch vụ thành công!");
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error) => {
      toast.error("Thêm dịch vụ thất bại", { description: error.message });
    },
  });
};

// Hook để cập nhật dịch vụ
export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      toast.success("Cập nhật thông tin thành công!");
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error) => {
      toast.error("Cập nhật thất bại", { description: error.message });
    },
  });
};

// Hook để xóa dịch vụ
export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      toast.success("Đã xóa dịch vụ!");
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error) => {
      toast.error("Xóa thất bại", { description: error.message });
    },
  });
};
