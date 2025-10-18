/**
 * @file src/features/promotion/schemas/index.ts
 * @description Schemas xác thực cho tính năng khuyến mãi.
 */

import * as z from 'zod';

/**
 * @const PromotionSchema
 * @description Schema để xác thực dữ liệu form thêm/sửa khuyến mãi.
 * Sử dụng date_range để làm việc với component DatePicker và refine để đảm bảo ngày kết thúc hợp lệ.
 */
export const PromotionSchema = z.object({
  name: z.string().min(1, "Tên khuyến mãi là bắt buộc"),
  description: z.string().optional(),
  discount_percentage: z.coerce
    .number({ invalid_type_error: "Phần trăm giảm giá phải là một con số" })
    .min(0, "Không được nhỏ hơn 0%")
    .max(100, "Không được lớn hơn 100%"),
  date_range: z.object({
    from: z.date({ required_error: "Ngày bắt đầu là bắt buộc" }),
    to: z.date({ required_error: "Ngày kết thúc là bắt buộc" }),
  }),
})
.refine((data) => data.date_range.to >= data.date_range.from, {
  message: "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu",
  path: ["date_range"], // Chỉ rõ lỗi ở trường date_range
});
