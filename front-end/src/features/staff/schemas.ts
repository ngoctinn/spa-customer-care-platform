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
