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
// ++ SỬA ĐỔI: Bổ sung các trường mới ++
export interface BookingState {
  serviceId?: string;
  treatmentId?: string;
  selectedDate?: Date;
  selectedTime?: string;
  customerInfo?: CustomerInfoValues;
  technicianIds: string[];
  // --- Các trường mới ---
  treatmentPackageId?: string; // ID của gói liệu trình đã mua
  sessionId?: string; // ID của buổi trong gói liệu trình
  purchasedServiceId?: string; // ID định danh dịch vụ lẻ đã mua
}
