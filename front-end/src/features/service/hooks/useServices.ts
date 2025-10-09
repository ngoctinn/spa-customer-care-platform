import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getServices,
  addService,
  updateService,
  deleteService,
} from "@/features/service/api/service.api";
import { Service } from "@/features/service/types";
import { useCrudMutations } from "@/hooks/useCrudMutations";
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
