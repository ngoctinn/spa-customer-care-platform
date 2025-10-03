import { User } from "@/features/user/types";

export interface Staff {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  role: "technician" | "receptionist" | "manager";
  avatar_url?: string;
  service_ids?: string[]; // Dịch vụ mà kỹ thuật viên có thể thực hiện
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

// Dùng khi cần kết hợp thông tin từ bảng `users`

export type FullStaffProfile = Omit<User, "roles"> & {
  staff_profile: Staff;
};
