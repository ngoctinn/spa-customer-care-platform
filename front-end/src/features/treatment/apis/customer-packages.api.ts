// src/features/treatment/api/customer-packages.api.ts
import apiClient from "@/lib/apiClient";
import { TreatmentPackage } from "@/features/treatment/types";

/**
 * Lấy danh sách các gói liệu trình đã mua của khách hàng hiện tại
 * cho một loại liệu trình cụ thể.
 * @param treatmentId ID của loại liệu trình (TreatmentPlan)
 * @returns Promise chứa danh sách các gói liệu trình (TreatmentPackage)
 */
export const getCustomerPackages = async (
  treatmentId: string
): Promise<TreatmentPackage[]> => {
  // Giả sử backend có endpoint này để lấy các gói đang hoạt động của user đã login
  return apiClient<TreatmentPackage[]>(
    `/customers/me/packages?treatmentId=${treatmentId}`
  );
};
