import { descriptionSchema, nameSchema, priceSchema } from "@/lib/schemas";
import { z } from "zod";

const treatmentPlanStepSchema = z.object({
  serviceId: z.string().uuid("Mỗi buổi phải chọn một dịch vụ hợp lệ."),
});

export const treatmentPlanFormSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  categories: z.array(z.string()).optional(),
  price: priceSchema,
  steps: z
    .array(treatmentPlanStepSchema)
    .min(1, "Liệu trình phải có ít nhất một buổi."),
  images: z.array(z.any()).optional(),
});

export type TreatmentPlanFormValues = z.infer<typeof treatmentPlanFormSchema>;
