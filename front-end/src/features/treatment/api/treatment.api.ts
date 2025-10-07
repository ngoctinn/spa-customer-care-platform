// src/features/treatment/api/treatment.api.ts
import { ImageUrl } from "@/features/shared/types";
import { TreatmentPlanFormValues } from "@/features/treatment/schemas";
import { TreatmentPlan } from "@/features/treatment/types";
import { uploadFile } from "@/features/upload/upload.api";
import apiClient from "@/lib/apiClient";
import { buildQueryString } from "@/lib/queryString";
import { TreatmentPlanFormValues } from "@/features/treatment/schemas";
import { handleImageUploads } from "@/features/upload/upload.api";

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
export interface GetTreatmentPlansParams {
  [key: string]: string | number | undefined;
  skip?: number;
  limit?: number;
  search?: string;
}

export const getTreatmentPlans = async (
  params?: GetTreatmentPlansParams
): Promise<TreatmentPlan[]> => {
  const query = buildQueryString(params);
  return apiClient<TreatmentPlan[]>(`/treatment-plans${query}`);
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
