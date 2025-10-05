// src/features/schedule/api/schedule.api.ts
import apiClient from "@/lib/apiClient";
import { WorkSchedule } from "@/features/schedule/types";

/**
 * Lấy lịch làm việc của một nhân viên
 * @param staffId ID của nhân viên
 */
export async function getWorkSchedule(staffId: string): Promise<WorkSchedule> {
  return apiClient<WorkSchedule>(`/schedules/work-schedule/${staffId}`);
}

/**
 * Cập nhật lịch làm việc của một nhân viên
 * @param staffId ID của nhân viên
 * @param scheduleData Dữ liệu lịch làm việc mới
 */
export async function updateWorkSchedule(
  staffId: string,
  scheduleData: Partial<WorkSchedule>
): Promise<WorkSchedule> {
  return apiClient<WorkSchedule>(`/schedules/work-schedule/${staffId}`, {
    method: "PUT",
    body: JSON.stringify(scheduleData),
  });
}
