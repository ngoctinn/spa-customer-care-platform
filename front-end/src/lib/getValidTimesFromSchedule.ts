// src/lib/getValidTimesFromSchedule.ts
import apiClient from "./apiClient";

/**
 * Lấy các khung giờ hợp lệ từ backend.
 * @param timesInOrder - Mảng các Date object cần kiểm tra.
 * @param event - Thông tin sự kiện (user ID và thời lượng).
 * @returns Promise chứa một mảng các Date object là các khung giờ hợp lệ.
 */
export async function getValidTimesFromSchedule(
  timesInOrder: Date[],
  event: { clerkUserId: string; durationInMinutes: number }
): Promise<Date[]> {
  try {
    // Gọi API tới backend để lấy các khung giờ hợp lệ
    const validTimesISO = await apiClient<string[]>(
      "/availability/valid-times",
      {
        method: "POST",
        body: JSON.stringify({
          times: timesInOrder.map((t) => t.toISOString()),
          clerkUserId: event.clerkUserId,
          durationInMinutes: event.durationInMinutes,
        }),
      }
    );

    // Chuyển đổi các chuỗi ISO 8601 trả về thành đối tượng Date
    return validTimesISO.map((isoString) => new Date(isoString));
  } catch (error) {
    console.error("Error fetching valid times:", error);
    // Trả về mảng rỗng nếu có lỗi để tránh crash ứng dụng
    return [];
  }
}
