import { UUID } from "crypto";

export interface DaySchedule {
  is_active: boolean;
  start_time: string; // "HH:mm"
  end_time: string; // "HH:mm"
}

// Lịch làm việc cố định của nhân viên
export interface WorkSchedule {
  id: UUID;
  staff_id: UUID;
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
  id: UUID;
  staff_id: UUID;
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
s;
