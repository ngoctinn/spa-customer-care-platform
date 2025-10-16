// src/features/resources/schemas/equipment.schema.ts
import { z } from "zod";

export const equipmentFormSchema = z.object({
  name: z.string().min(3, "Tên thiết bị phải có ít nhất 3 ký tự."),
  quantity: z.coerce.number().int().min(1, "Số lượng phải ít nhất là 1."),
  type: z.enum(["FIXED", "MOBILE"], {
    message: "Vui lòng chọn loại thiết bị.",
  }),
});

export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;
