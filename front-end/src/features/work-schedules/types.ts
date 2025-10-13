import { Appointment } from "@/features/appointment/types";

// Kiểu dữ liệu cho một ngày trong lịch mặc định
export interface DefaultScheduleBase {
  day_of_week: number; // 1-7 (T2-CN)
  is_active: boolean;
  start_time: string | null; // "HH:mm:ss" hoặc null
  end_time: string | null; // "HH:mm:ss" hoặc null
}

// Kiểu dữ liệu nhận về từ API GET
export type DefaultSchedulePublic = DefaultScheduleBase;

// Kiểu dữ liệu gửi đi khi cập nhật (PUT)
export interface DefaultScheduleUpdate {
  schedules: DefaultScheduleBase[];
}

export interface DaySchedule {
  is_active: boolean;
  start_time: string; // "HH:mm"
  end_time: string; // "HH:mm"
}

// Lịch làm việc cố định của nhân viên
export interface WorkSchedule {
  id: string;
  staff_id: string;
  schedule: {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
  };
  effective_date: Date;
  created_at: Date;
  updated_at: Date;
}

// Đăng ký lịch làm việc cho một tuần cụ thể
export interface ScheduleRegistration {
  id: string;
  staff_id: string;
  week_of: Date; // Ngày đầu tuần
  status: "pending" | "approved" | "rejected";
  schedule: {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
  };
  created_at: Date;
  updated_at: Date;
}

// Lịch đăng ký linh hoạt (FlexibleSchedules)
export interface FlexibleSchedule {
  id: string;
  user_id: string;
  start_time: Date;
  end_time: Date;
  status: "pending" | "approved" | "rejected";
  approved_by?: string; // user_id của người duyệt
  created_at: Date;
  updated_at: Date;
}

// Giao dịch chấm công (TimeEntries)
export interface TimeEntry {
  id: string;
  user_id: string;
  schedule_id: string; // Liên kết với FlexibleSchedule được duyệt
  check_in_time: Date;
  check_out_time?: Date; // Có thể null nếu chưa check-out
  check_in_location?: string; // Tọa độ GPS hoặc địa chỉ IP
  check_out_location?: string; // Tọa độ GPS hoặc địa chỉ IP
  duration_minutes?: number; // Tổng thời gian làm việc (tính bằng phút)
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * @description Ghi đè lịch làm việc cho một ngày cụ thể.
 * Ưu tiên cao hơn lịch làm việc cố định (DefaultSchedule).
 */
export interface ScheduleOverride {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  start_time: string | null; // "HH:mm" hoặc null nếu là ngày nghỉ
  end_time: string | null; // "HH:mm" hoặc null nếu là ngày nghỉ
  type: "WORK" | "DAY_OFF"; // Loại ghi đè: là ca làm việc hay ngày nghỉ
}

/**
 * @description Yêu cầu xin nghỉ phép của nhân viên.
 */
export interface TimeOffRequest {
  id: string;
  user_id: string;
  start_time: Date;
  end_time: Date;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: Date;
  // Thông tin về xung đột lịch hẹn (do backend cung cấp)
  conflicting_appointments?: Appointment[];
}
