// src/features/product/schemas.ts
import { z } from "zod";
import {
  nameSchema,
  priceSchema,
  descriptionSchema,
  imageSchema,
} from "@/lib/schemas";

const imageUnionSchema = z.union([imageSchema, z.instanceof(File)]);

// Schema cho form thêm/sửa sản phẩm
export const productFormSchema = z
  .object({
    name: nameSchema,
    description: descriptionSchema,
    categories: z.array(z.string()).optional(),
    price: priceSchema.optional(),
    images: z.array(imageSchema).optional(),
    isRetail: z.boolean(),
    isConsumable: z.boolean(),
    baseUnit: z.string().trim().min(1, "Đơn vị cơ sở không được để trống."),
    consumableUnit: z.string().trim().optional(),
    conversionRate: z.number().optional(),
    low_stock_threshold: z.number().min(0, "Ngưỡng phải là số không âm."),
  })
  .superRefine((data, ctx) => {
    // Quy tắc 1: Phải chọn ít nhất một loại (bán lẻ hoặc tiêu hao)
    if (!data.isRetail && !data.isConsumable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Phải chọn ít nhất một mục đích sử dụng (bán lẻ hoặc tiêu hao).",
        path: ["isRetail"], // Gắn lỗi vào trường đầu tiên cho dễ thấy
      });
    }

    // Quy tắc 2: Nếu là hàng bán lẻ, giá là bắt buộc
    if (data.isRetail && data.price === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Giá bán là bắt buộc đối với sản phẩm bán lẻ.",
        path: ["price"], // Gắn lỗi chính xác vào trường price
      });
    }

    // Quy tắc 3: Nếu là hàng tiêu hao, các trường liên quan là bắt buộc
    if (data.isConsumable) {
      if (!data.consumableUnit || data.consumableUnit.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Đơn vị tiêu hao là bắt buộc.",
          path: ["consumableUnit"], // Gắn lỗi chính xác vào consumableUnit
        });
      }
      if (!data.conversionRate || data.conversionRate <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tỷ lệ quy đổi phải lớn hơn 0.",
          path: ["conversionRate"], // Gắn lỗi chính xác vào conversionRate
        });
      }
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

// Schema cho form nhập kho
export const addStockSchema = z.object({
  productId: z.string().min(1, "Vui lòng chọn một sản phẩm."),
  quantityToAdd: z.number().min(1, "Số lượng nhập phải lớn hơn 0."),
});

export type AddStockFormValues = z.infer<typeof addStockSchema>;

export const stockAdjustmentSchema = z.object({
  productId: z.string().uuid("Vui lòng chọn một sản phẩm hợp lệ."),
  // Dùng `union` để chấp nhận cả số dương và âm
  quantity: z.number().refine((val) => val !== 0, "Số lượng phải khác 0."),
  notes: z.string().optional(),
});

export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>;
