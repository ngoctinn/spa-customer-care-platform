import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getServices,
  addService,
  updateService,
  deleteService,
} from "@/features/service/api/service.api";
import { Service } from "@/features/service/types";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/get-error-message";
import { ServiceFormValues } from "@/features/service/schemas";

const servicesQueryKeys = {
  all: ["services"] as const,
};

// Hook để lấy danh sách dịch vụ
export const useServices = () => {
  return useQuery<Service[]>({
    queryKey: servicesQueryKeys.all,
    queryFn: getServices,
  });
};

// Hook để thêm dịch vụ mới
export const useAddService = () => {
  const queryClient = useQueryClient();

  return useMutation<Service, unknown, ServiceFormValues>({
    mutationFn: (serviceData) => addService(serviceData),
    onSuccess: async () => {
      toast.success("Thêm dịch vụ thành công!");
      await queryClient.invalidateQueries({ queryKey: servicesQueryKeys.all });
    },
    onError: (error) => {
      toast.error("Thêm dịch vụ thất bại", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Hook để cập nhật dịch vụ
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Service,
    unknown,
    { serviceId: string; serviceData: Partial<ServiceFormValues> }
  >({
    mutationFn: ({ serviceId, serviceData }) =>
      updateService({ serviceId, serviceData }),
    onSuccess: async () => {
      toast.success("Cập nhật thông tin thành công!");
      await queryClient.invalidateQueries({ queryKey: servicesQueryKeys.all });
    },
    onError: (error) => {
      toast.error("Cập nhật thất bại", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Hook để xóa dịch vụ
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (serviceId) => deleteService(serviceId),
    onSuccess: async () => {
      toast.success("Đã xóa dịch vụ!");
      await queryClient.invalidateQueries({ queryKey: servicesQueryKeys.all });
    },
    onError: (error) => {
      toast.error("Xóa thất bại", {
        description: getErrorMessage(error),
      });
    },
  });
};
