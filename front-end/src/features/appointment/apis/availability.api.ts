// src/features/appointment/api/availability.api.ts
import apiClient from "@/lib/apiClient";

/**
 * Lấy danh sách các khung giờ còn trống.
 * @param serviceId ID của dịch vụ.
 * @param date Ngày cần kiểm tra (định dạng YYYY-MM-DD).
 * @param technicianId ID của kỹ thuật viên (tùy chọn).
 * @returns Một mảng các chuỗi giờ trống.
 */
export async function getAvailableSlots(
  serviceId: string,
  date: string,
  technicianId?: string
): Promise<string[]> {
  let endpoint = `/availability?serviceId=${serviceId}&date=${date}`;
  if (technicianId) {
    endpoint += `&technicianId=${technicianId}`;
  }
  return apiClient<string[]>(endpoint);
}
