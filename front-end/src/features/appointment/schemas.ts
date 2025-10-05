// src/features/appointment/schemas.ts
import { z } from "zod";

export const appointmentFormSchema = z
  .object({
    customer_id: z.string().uuid("Vui lòng chọn một khách hàng hợp lệ."),
    service_id: z.string().uuid("Vui lòng chọn một dịch vụ."),
    technician_id: z.string().uuid("Vui lòng chọn một kỹ thuật viên."),
    start_time: z.date().optional(),
    customer_note: z.string().optional(),
  })
  .refine((data) => data.start_time !== undefined, {
    message: "Vui lòng chọn ngày và giờ bắt đầu.",
    path: ["start_time"], // Chỉ định lỗi này thuộc về trường start_time
  });

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
