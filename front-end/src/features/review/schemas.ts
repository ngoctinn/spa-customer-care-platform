// src/features/review/schemas.ts
import { z } from "zod";
import { imageSchema } from "@/lib/schemas";

const imageUnionSchema = z.union([imageSchema, z.instanceof(File)]);

export const reviewFormSchema = z.object({
  rating: z
    .number()
    .min(1, "Vui lòng chọn ít nhất 1 sao.")
    .max(5, "Đánh giá không thể quá 5 sao."),
  comment: z.string().trim().min(10, "Bình luận cần có ít nhất 10 ký tự."),
  images: z.array(imageUnionSchema).optional(),

  // Các trường ẩn để xác định đối tượng đang được đánh giá
  item_id: z.string().uuid(),
  item_type: z.enum(["product", "service", "treatment"]),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
