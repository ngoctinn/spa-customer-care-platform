// src/features/resources/hooks/useEquipmentManagement.ts
import { useResourceManagement } from "@/features/management-pages/hooks/useResourceManagement";
import { Equipment } from "@/features/resources/types";
import {
  EquipmentFormValues,
  equipmentFormSchema,
} from "@/features/resources/schemas/equipment.schema";
import {
  addEquipment,
  updateEquipment,
  deleteEquipment,
} from "@/features/resources/apis/equipment.api";
import { useEquipments } from "./useResources";

export function useEquipmentManagement() {
  return useResourceManagement<Equipment, EquipmentFormValues>({
    queryKey: ["equipments"],
    useDataHook: useEquipments,
    addFn: addEquipment,
    updateFn: updateEquipment,
    deleteFn: deleteEquipment,
    formSchema: equipmentFormSchema,
    defaultFormValues: {
      name: "",
      quantity: 1,
      type: "MOBILE",
    },
    getEditFormValues: (equipment) => ({
      name: equipment.name,
      quantity: equipment.quantity,
      type: equipment.type,
    }),
    customMessages: {
      addSuccess: "Thêm thiết bị thành công!",
      updateSuccess: "Cập nhật thiết bị thành công!",
      deleteSuccess: "Đã xóa thiết bị!",
    },
  });
}
