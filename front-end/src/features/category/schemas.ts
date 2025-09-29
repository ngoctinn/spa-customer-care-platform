// src/features/category/schemas.ts
import { nameSchema } from "@/lib/schemas";
import { z } from "zod";

export const categoryFormSchema = z.object({
  name: nameSchema,
  // Đơn giản hóa: Chỉ cần khai báo enum, Zod sẽ tự động yêu cầu chọn 1 giá trị.
  type: z.enum(["service", "product", "treatment"]),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
