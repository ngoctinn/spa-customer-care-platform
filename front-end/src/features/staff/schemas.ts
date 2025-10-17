import { z } from "zod";
import { phoneSchema, nameSchema } from "@/lib/schemas"; // Assuming you have nameSchema

// Schema for the 'account' step
const accountSchema = z.object({
  email: z.string().email("Email không hợp lệ."),
  role_id: z.string().uuid("Vui lòng chọn vai trò hợp lệ."),
});

// Schema for the 'profile' step
const profileSchema = z.object({
  full_name: nameSchema,
  phone: phoneSchema.optional().or(z.literal("")),
});

// Schema for the 'services' step
const servicesSchema = z.object({
  service_ids: z.array(z.string().uuid()).optional(),
});

// Schema for the 'schedule' step
const dayScheduleSchema = z.object({
  day_of_week: z.number(),
  is_active: z.boolean(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
});

const scheduleSchema = z.object({
  schedules: z.array(dayScheduleSchema),
});

// Main schema for the entire onboarding wizard
export const staffOnboardingSchema = z.object({
  account: accountSchema,
  profile: profileSchema,
  services: servicesSchema,
  schedule: scheduleSchema,
});

// ++ ADD THIS EXPORT ++
export type StaffOnboardingFormValues = z.infer<typeof staffOnboardingSchema>;

// (The rest of your schemas.ts file remains the same)
export const staffFormSchema = z.object({
  phone_number: phoneSchema.optional().or(z.literal("")),
  position: z.string().optional(),
  hire_date: z.coerce.date().optional(),
  employment_status: z.enum([
    "active",
    "on_leave",
    "inactive",
    "pending_offboarding",
  ]),
  notes: z.string().optional(),
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;

export const staffServicesSchema = z.object({
  service_ids: z.array(z.string().uuid()),
});

export type StaffServicesFormValues = z.infer<typeof staffServicesSchema>;
