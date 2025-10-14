// src/features/staff/schemas.ts
import { z } from "zod";
import { phoneSchema } from "@/lib/schemas";

// Schema chính cho việc tạo/sửa hồ sơ nhân viên
export const staffFormSchema = z.object({
  phone_number: phoneSchema.optional().or(z.literal("")), // <-- Đổi tên
  position: z.string().optional(),
  hire_date: z.coerce.date().optional(), // Sử dụng coerce để chuyển đổi string sang Date
  employment_status: z.enum(["active", "on_leave", "inactive"]),
  notes: z.string().optional(),
  // user_id sẽ được thêm vào khi tạo mới, không cần trong form chính
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;

// Schema để cập nhật dịch vụ/kỹ năng (giữ nguyên)
export const staffServicesSchema = z.object({
  service_ids: z.array(z.string().uuid()),
});

export type StaffServicesFormValues = z.infer<typeof staffServicesSchema>;
