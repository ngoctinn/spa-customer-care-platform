// src/features/service/hooks/useServiceManagement.ts
import { useResourceManagement } from "@/features/management-pages/hooks/useResourceManagement";
import { useServices } from "./useServices";
import { Service } from "../types";
import { ServiceFormValues, serviceFormSchema } from "../schemas";
import { addService, updateService, deleteService } from "../api/service.api";

export function useServiceManagement() {
  return useResourceManagement<Service, ServiceFormValues>({
    queryKey: ["services"],
    useDataHook: useServices,
    addFn: addService,
    updateFn: (vars) =>
      updateService({ serviceId: vars.id, serviceData: vars.data }),
    deleteFn: deleteService,
    formSchema: serviceFormSchema,
    defaultFormValues: {
      name: "",
      description: "",
      category_ids: [],
      price: 0,
      duration_minutes: 30,
      consumables: [],
      preparation_notes: "",
      aftercare_instructions: "",
      contraindications: "",
      images: [],
      is_deleted: false,
      required_staff: 1,
      requires_bed: false,
      fixed_equipment_requirements: [],
      mobile_equipment_requirements: [],
    },
    getEditFormValues: (service) => ({
      ...service,
      category_ids: service.categories.map((c) => c.id),
      description: service.description || "",
      preparation_notes: service.preparation_notes || "",
      aftercare_instructions: service.aftercare_instructions || "",
      contraindications: service.contraindications || "",
    }),
    customMessages: {
      addSuccess: "Thêm dịch vụ thành công!",
      updateSuccess: "Cập nhật dịch vụ thành công!",
      deleteSuccess: "Đã xóa dịch vụ!",
    },
  });
}
