// src/features/service/api/service.api.ts
import { ServiceFormValues } from "@/features/service/schemas";
import { Service } from "@/features/service/types";
import apiClient from "@/lib/apiClient";

/**
 * Lấy danh sách tất cả dịch vụ
 */
export async function getServices(): Promise<Service[]> {
  return apiClient<Service[]>("/services");
}

/**
 * Lấy thông tin chi tiết một dịch vụ bằng ID
 * @param id ID của dịch vụ
 */
export async function getServiceById(id: string): Promise<Service> {
  return apiClient<Service>(`/services/services/${id}`);
}

/**
 * Thêm một dịch vụ mới
 * @param serviceData Dữ liệu dịch vụ từ form
 */
export async function addService(
  serviceData: ServiceFormValues
): Promise<Service> {
  // TODO: Xử lý upload ảnh lên cloud storage và lấy URL
  // Tạm thời gửi dữ liệu không bao gồm file ảnh
  const { images, ...payload } = serviceData;
  console.log("Payload to send:", payload);

  return apiClient<Service>("/services/services", {
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
  // Tương tự, cần xử lý upload ảnh mới và xóa ảnh cũ
  const { images, ...payload } = serviceData;

  return apiClient<Service>(`/services/services/${serviceId}`, {
    method: "PUT", // hoặc PATCH nếu backend hỗ trợ
    body: JSON.stringify(payload),
  });
}

/**
 * Xóa (vô hiệu hóa) một dịch vụ
 * @param serviceId ID của dịch vụ cần xóa
 */
export async function deleteService(serviceId: string): Promise<void> {
  return apiClient<void>(`/services/services/${serviceId}`, {
    method: "DELETE",
  });
}
