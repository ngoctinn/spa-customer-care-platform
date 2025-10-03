import { User } from "@/features/user/types";

export interface Staff {
  id: string;
  user_id: string;
  service_ids?: string[]; // Dịch vụ mà kỹ thuật viên có thể thực hiện
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export type FullStaffProfile = User & {
  staff_profile: Staff;
};
