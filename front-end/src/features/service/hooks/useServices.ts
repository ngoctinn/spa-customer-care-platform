import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getServices,
  addService,
  updateService,
  deleteService,
  getServiceById, // Import hàm API cần thiết
} from "@/features/service/api/service.api";
import { Service } from "@/features/service/types";
import { useCrudMutations } from "@/features/management-pages/hooks/useCrudMutations";
import { ServiceFormValues } from "@/features/service/schemas";

const queryKey = ["services"];

// Hook để lấy danh sách dịch vụ
export const useServices = () => {
  const { data, isLoading, isError, error } = useQuery<Service[]>({
    queryKey: queryKey,
    queryFn: () => getServices(),
  });
  return { data, isLoading, isError, error };
};

// Hook để lấy chi tiết một dịch vụ bằng ID
export const useServiceById = (serviceId: string) => {
  return useQuery<Service>({
    queryKey: [...queryKey, serviceId],
    queryFn: () => getServiceById(serviceId),
    enabled: !!serviceId, // Chỉ chạy query khi có serviceId
  });
};

// Hook để quản lý các mutations cho dịch vụ
export const useServiceMutations = () => {
  return useCrudMutations<
    Service,
    ServiceFormValues,
    Partial<ServiceFormValues>
  >(
    queryKey,
    addService,
    (vars: { id: string; data: Partial<ServiceFormValues> }) =>
      updateService({ serviceId: vars.id, serviceData: vars.data }),
    deleteService,
    {
      addSuccess: "Thêm dịch vụ thành công!",
      updateSuccess: "Cập nhật dịch vụ thành công!",
      deleteSuccess: "Đã xóa dịch vụ!",
    }
  );
};
