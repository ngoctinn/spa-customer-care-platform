// src/features/treatment/api/treatment.api.ts
import { TreatmentPlan } from "@/features/treatment/types";
import apiClient from "@/lib/apiClient";
import { TreatmentPlanFormValues } from "@/features/treatment/schemas";
import { ImageUrl } from "@/features/shared/types";
import { uploadFile } from "@/features/upload/upload.api";

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
      uploadPromises.push(uploadFile(image));
    } else {
      existingImages.push(image);
    }
  });

  const uploadedImages = await Promise.all(uploadPromises);
  return [...existingImages, ...uploadedImages];
}

/**
 * Thêm một liệu trình mới
 * @param planData Dữ liệu liệu trình từ form
 */
export async function addTreatmentPlan(
  planData: TreatmentPlanFormValues
): Promise<TreatmentPlan> {
  const { images, ...otherData } = planData;
  const processedImages = await handleImageUploads(images);
  const payload = {
    ...otherData,
    images: processedImages,
  };
  return apiClient<TreatmentPlan>("/treatment-plans", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Cập nhật thông tin một liệu trình
 * @param planId ID của liệu trình cần cập nhật
 * @param planData Dữ liệu cập nhật từ form
 */
export async function updateTreatmentPlan({
  planId,
  planData,
}: {
  planId: string;
  planData: Partial<TreatmentPlanFormValues>;
}): Promise<TreatmentPlan> {
  const { images, ...otherData } = planData;
  const processedImages = await handleImageUploads(images);
  const payload = {
    ...otherData,
    images: processedImages,
  };
  return apiClient<TreatmentPlan>(`/treatment-plans/${planId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Lấy danh sách tất cả các liệu trình
 */
export const getTreatmentPlans = async (): Promise<TreatmentPlan[]> => {
  return apiClient<TreatmentPlan[]>("/treatment-plans");
};

/**
 * Lấy thông tin chi tiết một liệu trình bằng ID
 * @param id ID của liệu trình
 */
export const getTreatmentPlanById = async (
  id: string
): Promise<TreatmentPlan> => {
  return apiClient<TreatmentPlan>(`/treatment-plans/${id}`);
};

/**
 * Xóa (vô hiệu hóa) một liệu trình
 * @param planId ID của liệu trình cần xóa
 */
export async function deleteTreatmentPlan(planId: string): Promise<void> {
  return apiClient<void>(`/treatment-plans/${planId}`, {
    method: "DELETE",
  });
}
