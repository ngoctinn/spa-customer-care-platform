// src/features/treatment/schemas.ts
import {
  descriptionSchema,
  nameSchema,
  priceSchema,
  imageSchema,
} from "@/lib/schemas";
import { z } from "zod";

const treatmentPlanStepSchema = z.object({
  serviceId: z.string().uuid("Mỗi buổi phải chọn một dịch vụ hợp lệ."),
  description: z.string().optional(),
});

export const treatmentPlanFormSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  category_ids: z.array(z.string()).optional(),
  price: priceSchema,
  steps: z
    .array(treatmentPlanStepSchema)
    .min(1, "Liệu trình phải có ít nhất một buổi."),
  images: z.array(imageSchema).optional(),
});

export type TreatmentPlanFormValues = z.infer<typeof treatmentPlanFormSchema>;
