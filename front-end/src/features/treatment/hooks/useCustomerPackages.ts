// src/features/treatment/hooks/useCustomerPackages.ts
import { useQuery } from "@tanstack/react-query";
import { getCustomerPackages } from "@/features/treatment/apis/customer-packages.api";

/**
 * Hook để lấy danh sách các gói liệu trình đã mua và chưa hoàn thành
 * của khách hàng hiện tại cho một loại liệu trình cụ thể.
 * @param treatmentId ID của loại liệu trình (TreatmentPlan)
 */
export const useCustomerPackages = (treatmentId: string) => {
  return useQuery({
    queryKey: ["customerPackages", treatmentId],
    queryFn: () => getCustomerPackages(treatmentId),
    enabled: !!treatmentId, // Chỉ chạy query khi có treatmentId
  });
};
