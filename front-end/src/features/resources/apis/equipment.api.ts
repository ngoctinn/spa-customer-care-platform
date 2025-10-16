// src/features/resources/api/equipment.api.ts
import apiClient from "@/lib/apiClient";
import { Equipment } from "@/features/resources/types";
import { EquipmentFormValues } from "@/features/resources/schemas/equipment.schema";

/**
 * Lấy danh sách tất cả thiết bị
 */
export async function getEquipments(): Promise<Equipment[]> {
  return apiClient<Equipment[]>("/resources/equipment");
}

/**
 * Thêm một thiết bị mới
 */
export async function addEquipment(
  data: EquipmentFormValues
): Promise<Equipment> {
  return apiClient<Equipment>("/resources/equipment", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Cập nhật thông tin một thiết bị
 */
export async function updateEquipment({
  id,
  data,
}: {
  id: string;
  data: Partial<EquipmentFormValues>;
}): Promise<Equipment> {
  return apiClient<Equipment>(`/resources/equipment/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Xóa một thiết bị
 */
export async function deleteEquipment(id: string): Promise<void> {
  return apiClient<void>(`/resources/equipment/${id}`, {
    method: "DELETE",
  });
}
