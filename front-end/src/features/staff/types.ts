// src/features/staff/types.ts

import { Service } from "@/features/service/types";
import { User } from "@/features/user/types";

// Định nghĩa trạng thái làm việc dựa trên API mới
export type EmploymentStatus = "active" | "on_leave" | "inactive";

// Cập nhật lại cấu trúc Staff Profile để khớp với API
export interface StaffProfile {
  id: string; // ID của Staff Profile
  user: User;
  phone_number: string | null;
  position?: string | null;
  hire_date?: string | null; // Giữ dạng string ISO 8601
  employment_status: EmploymentStatus;
  notes?: string | null;
  full_name: string;
  avatar_url?: string | null;

  user_email: User["email"] | null;
  user_is_active: User["is_active"] | null;

  // Dữ liệu lồng vào khi gọi API chi tiết
  services?: Service[];
}

// FullStaffProfile giờ đây chính là StaffProfile
export type FullStaffProfile = StaffProfile;
