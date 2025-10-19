// src/features/promotion/schemas.ts
import { z } from "zod";

export const promotionSchema = z // Đổi tên thành promotionSchema
  .object({
    title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự."),
    description: z.string().optional(),
    discount_percent: z // Đổi tên thành discount_percent
      .number()
      .min(0, "Tỷ lệ giảm giá không được âm.")
      .max(100, "Tỷ lệ giảm giá không được lớn hơn 100."),
    start_date: z.date(),
    end_date: z.date(),
  })
  .superRefine((data, ctx) => {
    if (data.start_date && data.end_date && data.end_date <= data.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ngày kết thúc phải sau ngày bắt đầu.",
        path: ["end_date"],
      });
    }
  });

export type PromotionFormValues = z.infer<typeof promotionSchema>;
