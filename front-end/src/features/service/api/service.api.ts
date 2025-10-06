// src/features/service/api/service.api.ts
import { ServiceFormValues } from "@/features/service/schemas";
import { Service } from "@/features/service/types";
import apiClient from "@/lib/apiClient";
import { buildQueryString } from "@/lib/queryString";
import {
  appendFormDataList,
  appendFormDataValue,
  splitImages,
} from "@/lib/form-data-utils";

export type GetServicesParams = {
  skip?: number;
  limit?: number;
  search?: string;
};

function buildServiceFormData(
  serviceData: Partial<ServiceFormValues>
): FormData {
  const formData = new FormData();

  appendFormDataValue(formData, "name", serviceData.name);
  appendFormDataValue(formData, "description", serviceData.description);
  appendFormDataValue(formData, "price", serviceData.price);
  appendFormDataValue(
    formData,
    "duration_minutes",
    serviceData.duration_minutes
  );
  appendFormDataValue(
    formData,
    "preparation_notes",
    serviceData.preparation_notes
  );
  appendFormDataValue(
    formData,
    "aftercare_instructions",
    serviceData.aftercare_instructions
  );
  appendFormDataValue(
    formData,
    "contraindications",
    serviceData.contraindications
  );

  if (serviceData.categories) {
    appendFormDataList(formData, "category_ids", serviceData.categories);
  }

  if (serviceData.primary_image_id) {
    appendFormDataValue(
      formData,
      "primary_image_id",
      serviceData.primary_image_id
    );
  }

  if (serviceData.images) {
    const { files, existingIds } = splitImages(serviceData.images);
    if (existingIds.length > 0) {
      appendFormDataList(formData, "existing_image_ids", existingIds);
    }
    files.forEach((file) => {
      formData.append("images", file);
    });
  }

  return formData;
}

/**
 * Thêm một dịch vụ mới
 * @param serviceData Dữ liệu dịch vụ từ form (có thể chứa File ảnh)
 */
export async function addService(
  serviceData: ServiceFormValues
): Promise<Service> {
  const formData = buildServiceFormData(serviceData);

  return apiClient<Service>("/services", {
    method: "POST",
    body: formData,
  });
}

/**
 * Cập nhật thông tin một dịch vụ
 * @param serviceId ID của dịch vụ cần cập nhật
 * @param serviceData Dữ liệu cập nhật từ form (có thể chứa File ảnh)
 */
export async function updateService({
  serviceId,
  serviceData,
}: {
  serviceId: string;
  serviceData: Partial<ServiceFormValues>;
}): Promise<Service> {
  const formData = buildServiceFormData(serviceData);

  return apiClient<Service>(`/services/${serviceId}`, {
    method: "PUT",
    body: formData,
  });
}

/**
 * Lấy danh sách tất cả dịch vụ
 */
export async function getServices(
  params?: GetServicesParams
): Promise<Service[]> {
  const query = buildQueryString(params);
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
