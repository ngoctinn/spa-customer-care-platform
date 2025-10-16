import { z } from "zod";
import {
  nameSchema,
  descriptionSchema,
  priceSchema,
  imageSchema,
} from "@/lib/schemas";

const serviceConsumableSchema = z.object({
  productId: z.string().uuid("ID sản phẩm không hợp lệ."),
  quantityUsed: z.number().min(0.01, "Số lượng phải lớn hơn 0."),
});

const equipmentRequirementSchema = z.object({
  equipment_id: z.string().uuid("ID thiết bị không hợp lệ."),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0."),
});

export const serviceFormSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  category_ids: z.array(z.string()).optional(),
  price: priceSchema,
  duration_minutes: z.number().int().min(5, "Thời lượng phải ít nhất 5 phút."),
  consumables: z.array(serviceConsumableSchema).optional(),
  preparation_notes: z.string().optional(),
  aftercare_instructions: z.string().optional(),
  contraindications: z.string().optional(),
  images: z.array(imageSchema).optional(),
  is_deleted: z.boolean().optional(),

  // --- CÁC TRƯỜNG MỚI ĐÃ ĐƯỢC THÊM VÀO SCHEMA ---
  required_staff: z.number().min(1, "Yêu cầu ít nhất 1 nhân viên."),
  // --- THAY ĐỔI: Loại bỏ .default(false) để TypeScript suy luận kiểu chính xác ---
  requires_bed: z.boolean(),
  fixed_equipment_requirements: z.array(equipmentRequirementSchema).optional(),
  mobile_equipment_requirements: z.array(equipmentRequirementSchema).optional(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
