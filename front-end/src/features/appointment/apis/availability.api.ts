// src/features/appointment/apis/availability.api.ts
import apiClient from "@/lib/apiClient";

/**
 * Lấy danh sách các khung giờ còn trống.
 * @param serviceId ID của dịch vụ.
 * @param date Ngày cần kiểm tra (định dạng YYYY-MM-DD).
 * @param technicianIds (Tùy chọn) Mảng ID của các kỹ thuật viên.
 * @returns Một mảng các chuỗi giờ trống.
 */
export async function getAvailableSlots(
  serviceId: string,
  date: string,
  technicianIds?: string[] // <-- THAY ĐỔI: Chuyển sang mảng string[]
): Promise<string[]> {
  // Endpoint và các tham số không thay đổi
  let endpoint = `/availability?serviceId=${serviceId}&date=${date}`;
  // THAY ĐỔI: Nếu có technicianIds, nối chúng lại thành chuỗi và gửi đi
  if (technicianIds && technicianIds.length > 0) {
    endpoint += `&technicianIds=${technicianIds.join(",")}`;
  }
  return apiClient<string[]>(endpoint);
}
