// src/features/resources/schemas/bed.schema.ts
import { z } from "zod";

export const bedFormSchema = z.object({
  name: z.string().min(3, "Tên giường phải có ít nhất 3 ký tự."),
  room_id: z.string().uuid("Vui lòng chọn một phòng hợp lệ."),
});

export type BedFormValues = z.infer<typeof bedFormSchema>;
