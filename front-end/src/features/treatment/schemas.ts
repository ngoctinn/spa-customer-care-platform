import {
  descriptionSchema,
  nameSchema,
  priceSchema,
  imageFileSchema,
} from "@/lib/schemas";
import { z } from "zod";

const treatmentPlanStepSchema = z.object({
  serviceIds: z
    .array(z.string())
    .min(1, "Mỗi buổi phải có ít nhất một dịch vụ."),
});

export const treatmentPlanFormSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  categories: z.array(z.string()).optional(),
  price: priceSchema,
  steps: z
    .array(treatmentPlanStepSchema)
    .min(1, "Liệu trình phải có ít nhất một buổi."),
  imageFile: imageFileSchema,
  imageFiles: z.array(z.any()).optional(),
});

export type TreatmentPlanFormValues = z.infer<typeof treatmentPlanFormSchema>;
