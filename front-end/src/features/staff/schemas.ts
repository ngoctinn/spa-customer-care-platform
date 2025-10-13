// src/features/staff/schemas.ts
import { z } from "zod";
import { nameSchema, emailSchema, phoneSchema } from "@/lib/schemas";

export const staffFormSchema = z.object({
  full_name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal("")), // Cho phép để trống SĐT
  role_id: z.string().uuid({ message: "Vui lòng chọn một vai trò hợp lệ." }),
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;

// --- START: Schema cho luồng Onboarding Wizard ---

// Bước 1: Thông tin tài khoản
const accountSchema = z.object({
  email: emailSchema,
  role_id: z.string().uuid("Vui lòng chọn vai trò."),
});

// Bước 2: Thông tin hồ sơ
const profileSchema = z.object({
  full_name: nameSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  // Thêm các trường khác nếu cần, ví dụ:
  // position: z.string().optional(),
  // hire_date: z.date().optional(),
});

// Bước 3: Phân công dịch vụ
const servicesSchema = z.object({
  service_ids: z
    .array(z.string().uuid())
    .min(1, "Phải chọn ít nhất một dịch vụ."),
});

// Bước 4: Lịch làm việc
const dayScheduleSchema = z.object({
  day_of_week: z.number().min(1).max(7),
  is_active: z.boolean(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
});

const scheduleSchema = z.object({
  schedules: z.array(dayScheduleSchema).length(7),
});

// Schema tổng hợp cho toàn bộ luồng Onboarding
export const staffOnboardingSchema = z.object({
  account: accountSchema,
  profile: profileSchema,
  services: servicesSchema,
  schedule: scheduleSchema,
});

export type StaffOnboardingFormValues = z.infer<typeof staffOnboardingSchema>;

// Schema để cập nhật dịch vụ/kỹ năng
export const staffServicesSchema = z.object({
  service_ids: z.array(z.string().uuid()),
});

export type StaffServicesFormValues = z.infer<typeof staffServicesSchema>;

// Schema để cập nhật trạng thái làm việc
export const staffStatusSchema = z.object({
  employment_status: z.string().min(1, "Vui lòng chọn trạng thái."),
  is_active: z.boolean(),
});

export type StaffStatusFormValues = z.infer<typeof staffStatusSchema>;
