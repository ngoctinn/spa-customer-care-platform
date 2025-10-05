// src/features/service/schemas.ts
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

const imageUnionSchema = z.union([imageSchema, z.instanceof(File)]);

export const serviceFormSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  categories: z.array(z.string()).optional(),
  price: priceSchema,
  duration_minutes: z.number().int().min(5, "Thời lượng phải ít nhất 5 phút."),
  consumables: z.array(serviceConsumableSchema).optional(),
  preparation_notes: z.string().optional(),
  aftercare_instructions: z.string().optional(),
  contraindications: z.string().optional(),
  images: z.array(imageUnionSchema).optional(),
  is_deleted: z.boolean().optional(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
