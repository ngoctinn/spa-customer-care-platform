// src/features/service/api/service.api.ts
import { ServiceFormValues } from "@/features/service/schemas";
import { Service } from "@/features/service/types";
import apiClient from "@/lib/apiClient";
import { buildQueryString } from "@/lib/queryString";

export interface GetServicesParams {
  skip?: number;
  limit?: number;
  search?: string;
}

/**
 * Thêm một dịch vụ mới
 * @param serviceData Dữ liệu dịch vụ từ form
 */
export async function addService(
  serviceData: ServiceFormValues
): Promise<Service> {
  const payload = {
    ...serviceData,
    existing_image_ids: serviceData.images?.map((img) => img.id) || [],
    primary_image_id: serviceData.images?.[0]?.id || null,
  };
  delete (payload as any).images;

  return apiClient<Service>("/services", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Cập nhật thông tin một dịch vụ
 * @param serviceId ID của dịch vụ cần cập nhật
 * @param serviceData Dữ liệu cập nhật từ form
 */
export async function updateService({
  serviceId,
  serviceData,
}: {
  serviceId: string;
  serviceData: Partial<ServiceFormValues>;
}): Promise<Service> {
  const payload = {
    ...serviceData,
    existing_image_ids: serviceData.images?.map((img) => img.id),
    primary_image_id: serviceData.images?.[0]?.id,
  };
  delete (payload as any).images;

  return apiClient<Service>(`/services/${serviceId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Lấy danh sách tất cả dịch vụ
 */
export async function getServices(
  params?: GetServicesParams
): Promise<Service[]> {
  const query = buildQueryString({ ...params });
  return apiClient<Service[]>(`/services${query}`);
}

/**
 * Lấy thông tin chi tiết một dịch vụ bằng ID
 * @param id ID của dịch vụ
 */
export async function getServiceById(id: string): Promise<Service> {
  return apiClient<Service>(`/services/${id}`);
}

/**
 * Xóa (vô hiệu hóa) một dịch vụ
 * @param serviceId ID của dịch vụ cần xóa
 */
export async function deleteService(serviceId: string): Promise<void> {
  return apiClient<void>(`/services/${serviceId}`, {
    method: "DELETE",
  });
}
