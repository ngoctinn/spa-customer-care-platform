import { UUID } from "crypto";

export interface Staff {
  id: UUID;
  user_id: UUID;
  name: string;
  phone: string;
  role: "technician" | "receptionist" | "manager";
  avatar_url?: string;
  service_ids?: UUID[]; // Dịch vụ mà kỹ thuật viên có thể thực hiện
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

// Dùng khi cần kết hợp thông tin từ bảng `users`
export type FullStaffProfile = Staff & {
  email: string;
  status: "active" | "inactive";
};
