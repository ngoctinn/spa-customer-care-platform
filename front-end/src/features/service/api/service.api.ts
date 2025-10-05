// src/features/service/api/service.api.ts
import { ServiceFormValues } from "@/features/service/schemas";
import { Service } from "@/features/service/types";
import { ImageUrl } from "@/features/shared/types";
import { uploadFile } from "@/features/upload/upload.api"; // highlight-line
import apiClient from "@/lib/apiClient";

/**
 * Xử lý upload các file mới và trả về danh sách ImageUrl hoàn chỉnh.
 * @param images Mảng chứa cả File (ảnh mới) và ImageUrl (ảnh cũ).
 * @returns Danh sách ImageUrl đã được xử lý.
 */
async function handleImageUploads(
  images: (File | ImageUrl)[] | undefined
): Promise<ImageUrl[]> {
  if (!images || images.length === 0) {
    return [];
  }

  const uploadPromises: Promise<ImageUrl>[] = [];
  const existingImages: ImageUrl[] = [];

  images.forEach((image) => {
    if (image instanceof File) {
      // Nếu là file mới, thêm vào danh sách chờ upload
      uploadPromises.push(uploadFile(image));
    } else {
      // Nếu là ảnh đã có, giữ lại
      existingImages.push(image);
    }
  });

  // Chờ tất cả các file được upload xong
  const uploadedImages = await Promise.all(uploadPromises);

  // Kết hợp ảnh cũ và ảnh mới đã upload
  return [...existingImages, ...uploadedImages];
}

/**
 * Thêm một dịch vụ mới
 * @param serviceData Dữ liệu dịch vụ từ form (có thể chứa File ảnh)
 */
export async function addService(
  serviceData: ServiceFormValues
): Promise<Service> {
  // Tách riêng các file ảnh và các dữ liệu khác
  const { images, ...otherData } = serviceData;

  // 1. Tải các file ảnh mới lên và lấy URL
  const processedImages = await handleImageUploads(images);

  // 2. Gộp URL ảnh đã xử lý vào payload cuối cùng
  const payload = {
    ...otherData,
    images: processedImages,
  };

  console.log("Payload to send for addService:", payload);

  return apiClient<Service>("/services/services", {
    method: "POST",
    body: JSON.stringify(payload),
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
  const { images, ...otherData } = serviceData;

  // 1. Tải các file ảnh mới lên và lấy URL
  const processedImages = await handleImageUploads(images);

  // 2. Gộp URL ảnh đã xử lý vào payload cuối cùng
  const payload = {
    ...otherData,
    images: processedImages,
  };

  console.log("Payload to send for updateService:", payload);

  return apiClient<Service>(`/services/services/${serviceId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

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
 * Xóa (vô hiệu hóa) một dịch vụ
 * @param serviceId ID của dịch vụ cần xóa
 */
export async function deleteService(serviceId: string): Promise<void> {
  return apiClient<void>(`/services/services/${serviceId}`, {
    method: "DELETE",
  });
}
