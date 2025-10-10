// src/features/schedule/api/schedule.api.ts
import apiClient from "@/lib/apiClient";
import {
  FlexibleSchedule,
  TimeEntry,
  WorkSchedule,
} from "@/features/schedule/types";
import { buildQueryString } from "@/lib/queryString";
import {
  DefaultScheduleUpdate,
  DefaultSchedulePublic,
} from "@/features/schedule/types";

/**
 * Lấy lịch làm việc của một nhân viên
 * @param staffId ID của nhân viên
 */
export async function getWorkSchedule(
  staffId: string
): Promise<DefaultSchedulePublic[]> {
  // SỬA ĐỔI: Endpoint trỏ đến API quản lý lịch mặc định
  return apiClient<DefaultSchedulePublic[]>(
    `/admin/users/${staffId}/default-schedules`
  );
}

/**
 * Cập nhật lịch làm việc mặc định của một nhân viên
 * @param staffId ID của nhân viên
 * @param scheduleData Dữ liệu lịch làm việc mới (mảng 7 ngày)
 */
export async function updateWorkSchedule(
  staffId: string,
  schedules_data: DefaultScheduleUpdate
): Promise<DefaultSchedulePublic[]> {
  // SỬA ĐỔI: Endpoint và method
  return apiClient<DefaultSchedulePublic[]>(
    `/admin/users/${staffId}/default-schedules`,
    {
      method: "PUT",
      body: JSON.stringify(schedules_data),
    }
  );
}

/**
 * Nhân viên đăng ký ca làm việc mới.
 * @param submissionData Dữ liệu ca làm việc, gồm start_time và end_time.
 */
export async function submitFlexibleSchedule(
  submissionData: Pick<FlexibleSchedule, "start_time" | "end_time">
): Promise<FlexibleSchedule> {
  return apiClient<FlexibleSchedule>("/schedules/submission", {
    method: "POST",
    body: JSON.stringify(submissionData),
  });
}

/**
 * Admin lấy lịch làm việc (linh hoạt) của tất cả nhân viên trong một khoảng thời gian.
 * @param startDate Ngày bắt đầu (ISO string).
 * @param endDate Ngày kết thúc (ISO string).
 */
export async function getAdminSchedules(
  startDate: string,
  endDate: string
): Promise<FlexibleSchedule[]> {
  return apiClient<FlexibleSchedule[]>(
    `/schedules/admin?date_range=${startDate},${endDate}`
  );
}

/**
 * Admin duyệt một ca làm việc đã đăng ký.
 * @param scheduleId ID của ca làm việc cần duyệt.
 */
export async function approveSchedule(
  scheduleId: string
): Promise<FlexibleSchedule> {
  return apiClient<FlexibleSchedule>(`/schedules/${scheduleId}/approve`, {
    method: "PUT",
  });
}

/**
 * Admin từ chối một ca làm việc đã đăng ký.
 * @param scheduleId ID của ca làm việc cần từ chối.
 */
export async function rejectSchedule(
  scheduleId: string
): Promise<FlexibleSchedule> {
  return apiClient<FlexibleSchedule>(`/schedules/${scheduleId}/reject`, {
    method: "PUT",
  });
}

/**
 * Ghi nhận thời gian bắt đầu ca làm việc (Check-in).
 * @param data Dữ liệu check-in, có thể chứa thông tin vị trí.
 */
export async function checkIn(data: {
  schedule_id: string;
  location?: string;
}): Promise<TimeEntry> {
  return apiClient<TimeEntry>("/time-clock/check-in", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Ghi nhận thời gian kết thúc ca làm việc (Check-out).
 * @param timeEntryId ID của lần check-in trước đó.
 * @param data Dữ liệu check-out, có thể chứa thông tin vị trí.
 */
export async function checkOut(
  timeEntryId: string,
  data: { location?: string }
): Promise<TimeEntry> {
  return apiClient<TimeEntry>(`/time-clock/check-out/${timeEntryId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Lấy lịch sử chấm công của nhân viên hiện tại.
 */
export async function getTimeEntries(): Promise<TimeEntry[]> {
  return apiClient<TimeEntry[]>("/time-clock/history");
}

/**
 * Lấy danh sách các ca làm việc (linh hoạt) của nhân viên đang đăng nhập.
 * @param startDate Ngày bắt đầu (ISO string).
 * @param endDate Ngày kết thúc (ISO string).
 */
export async function getMySchedules(
  startDate: string,
  endDate: string
): Promise<FlexibleSchedule[]> {
  const query = buildQueryString({ start_date: startDate, end_date: endDate });
  return apiClient<FlexibleSchedule[]>(`/api/schedules/my-schedules${query}`);
}
