// src/features/review/schemas.ts
import { z } from "zod";

export const reviewFormSchema = z.object({
  rating: z.number().min(1, "Vui lòng chọn ít nhất 1 sao.").max(5),
  comment: z.string().min(10, "Bình luận phải có ít nhất 10 ký tự.").optional(),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
