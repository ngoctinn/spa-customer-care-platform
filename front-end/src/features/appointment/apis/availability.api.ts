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
  technicianIds?: string[]
): Promise<string[]> {
  let endpoint = `/availability?serviceId=${serviceId}&date=${date}`;

  // Nếu có technicianIds và mảng không rỗng, nối chúng lại thành chuỗi và gửi đi
  if (technicianIds && technicianIds.length > 0) {
    endpoint += `&technicianIds=${technicianIds.join(",")}`;
  }
  // Nếu technicianIds là mảng rỗng hoặc undefined, không thêm vào query string.
  // Backend sẽ hiểu rằng cần tìm bất kỳ kỹ thuật viên nào phù hợp.

  return apiClient<string[]>(endpoint);
}
