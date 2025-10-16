// src/features/booking/schemas.ts
import { z } from "zod";
import { nameSchema, phoneSchema, emailSchema } from "@/lib/schemas";

// Schema để xác thực form thông tin khách hàng
export const customerInfoSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("")), // Email có thể bỏ trống
  note: z.string().optional(),
});

// Type cho dữ liệu của form
export type CustomerInfoValues = z.infer<typeof customerInfoSchema>;

// Type để quản lý trạng thái của toàn bộ quy trình đặt lịch
export interface BookingState {
  serviceId?: string;
  treatmentId?: string;
  selectedDate?: Date;
  selectedTime?: string;
  customerInfo?: CustomerInfoValues;
  technicianIds: string[];
}
