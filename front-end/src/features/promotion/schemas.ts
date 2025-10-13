// src/features/promotion/schemas.ts
import { z } from "zod";

export const promotionFormSchema = z
  .object({
    title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự."),
    description: z.string().optional(),
    discount_percent: z
      .number()
      .min(0, "Tỷ lệ giảm giá không được âm.")
      .max(100, "Tỷ lệ giảm giá không được lớn hơn 100."),
    // Đơn giản hóa định nghĩa để loại bỏ lỗi TypeScript.
    // Zod sẽ tự xử lý thông báo lỗi mặc định khi ngày không hợp lệ.
    start_date: z.date(),
    end_date: z.date(),
  })
  .superRefine((data, ctx) => {
    // superRefine vẫn hoạt động bình thường để so sánh hai ngày
    if (data.start_date && data.end_date && data.end_date <= data.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ngày kết thúc phải sau ngày bắt đầu.",
        path: ["end_date"],
      });
    }
  });

export type PromotionFormValues = z.infer<typeof promotionFormSchema>;
