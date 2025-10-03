// src/features/service/api/service.api.ts
import { Service } from "@/features/service/types";
import apiClient from "@/lib/apiClient";

/**
 * Lấy danh sách tất cả dịch vụ
 */
export async function getServices(): Promise<Service[]> {
  return apiClient<Service[]>("/services/services");
}

/**
 * Lấy thông tin chi tiết một dịch vụ bằng ID
 * @param id ID của dịch vụ
 */
export async function getServiceById(id: string): Promise<Service> {
  return apiClient<Service>(`/services/services/${id}`);
}
