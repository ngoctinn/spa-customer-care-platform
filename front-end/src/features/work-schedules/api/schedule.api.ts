import apiClient from "@/lib/apiClient";
import {
  FlexibleSchedule,
  TimeEntry,
  ScheduleOverride,
  TimeOffRequest,
  DefaultSchedulePublic,
  DefaultScheduleUpdate,
} from "@/features/work-schedules/types";
import { buildQueryString } from "@/lib/queryString";
import { TimeOffRequestFormValues } from "@/features/work-schedules/schemas/time-off.schema";
/**
 * Lấy lịch làm việc mặc định của một nhân viên.
 * @param staffId ID của nhân viên (user_id)
 */
export async function getWorkSchedule(
  staffId: string
): Promise<DefaultSchedulePublic[]> {
  return apiClient<DefaultSchedulePublic[]>(
    `/admin/users/${staffId}/default-schedules`
  );
}

/**
 * Cập nhật lịch làm việc mặc định cho một nhân viên.
 * @param staffId ID của nhân viên (user_id)
 * @param scheduleData Dữ liệu lịch làm việc mới
 */
export async function updateWorkSchedule(
  staffId: string,
  scheduleData: DefaultScheduleUpdate
): Promise<DefaultSchedulePublic[]> {
  return apiClient<DefaultSchedulePublic[]>(
    `/admin/users/${staffId}/default-schedules`,
    {
      method: "PUT",
      body: JSON.stringify(scheduleData),
    }
  );
}
/**
 * Nhân viên đăng ký ca làm việc mới.
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

/**
 * Admin tạo một bản ghi ghi đè lịch làm việc cho nhân viên.
 * @param staffId ID của nhân viên.
 * @param overrideData Dữ liệu ghi đè.
 */
export async function createScheduleOverride(
  staffId: string,
  overrideData: Omit<ScheduleOverride, "id" | "user_id">
): Promise<ScheduleOverride> {
  return apiClient<ScheduleOverride>(`/staff/${staffId}/schedule-overrides`, {
    method: "POST",
    body: JSON.stringify(overrideData),
  });
}

/**
 * Nhân viên gửi yêu cầu xin nghỉ phép.
 * Cần truyền staff_id từ client.
 */
export async function requestTimeOff(
  requestData: TimeOffRequestFormValues & { staff_id: string }
): Promise<TimeOffRequest> {
  return apiClient<TimeOffRequest>("/staff/time-off", {
    // <-- ENDPOINT MỚI
    method: "POST",
    body: JSON.stringify(requestData),
  });
}

/**
 * Admin lấy danh sách các yêu cầu nghỉ phép.
 * @param status Lọc theo trạng thái (ví dụ: "PENDING").
 */
export async function getTimeOffRequests(
  status?: "PENDING" | "APPROVED" | "REJECTED"
): Promise<TimeOffRequest[]> {
  const query = buildQueryString({ status });
  return apiClient<TimeOffRequest[]>(`/time-off${query}`);
}

/**
 * Admin duyệt hoặc từ chối một yêu cầu nghỉ phép.
 * @param requestId ID của yêu cầu.
 * @param decision Dữ liệu quyết định (status, note).
 */
export async function decideTimeOffRequest(
  requestId: string,
  decision: { status: "da_duyet" | "tu_choi"; decision_note?: string }
): Promise<TimeOffRequest> {
  return apiClient<TimeOffRequest>(`/staff/time-off/${requestId}`, {
    // <-- ENDPOINT MỚI
    method: "PUT",
    body: JSON.stringify(decision),
  });
}
