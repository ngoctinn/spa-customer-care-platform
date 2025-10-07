// src/features/category/schemas.ts
import { nameSchema } from "@/lib/schemas";
import { z } from "zod";

export const categoryFormSchema = z.object({
  name: nameSchema,
  category_type: z.enum(["service", "product", "treatment"]),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
