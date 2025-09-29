// src/features/product/schemas.ts
import { z } from "zod";
import {
  nameSchema,
  priceSchema,
  descriptionSchema,
  imageFileSchema,
} from "@/lib/schemas";

// Schema cho form thêm/sửa sản phẩm
export const productFormSchema = z
  .object({
    name: nameSchema,
    description: descriptionSchema,
    categories: z.array(z.string()).optional(),
    price: priceSchema,
    stock: z.number().min(0, "Số lượng tồn kho không được âm."),
    images: z.array(z.any()).optional(),
    isRetail: z.boolean(),
    isConsumable: z.boolean(),
    baseUnit: z.string().trim().min(1, "Đơn vị cơ sở không được để trống."),
    consumableUnit: z.string().optional(),
    conversionRate: z.number().optional(),
  })
  .refine((data) => data.isRetail || data.isConsumable, {
    message: "Sản phẩm phải là hàng bán lẻ hoặc hàng tiêu hao (hoặc cả hai).",
    path: ["isRetail"],
  })
  .refine(
    (data) => {
      // Nếu là hàng tiêu hao, phải có đơn vị tiêu hao và tỷ lệ quy đổi
      if (data.isConsumable) {
        return (
          data.consumableUnit && data.conversionRate && data.conversionRate > 0
        );
      }
      return true;
    },
    {
      message:
        "Nếu là hàng tiêu hao, phải nhập đơn vị và tỷ lệ quy đổi lớn hơn 0.",
      path: ["conversionRate"],
    }
  );

export type ProductFormValues = z.infer<typeof productFormSchema>;

// Schema cho form nhập kho
export const addStockSchema = z.object({
  productId: z.string().min(1, "Vui lòng chọn một sản phẩm."),
  quantityToAdd: z.number().min(1, "Số lượng nhập phải lớn hơn 0."),
});

export type AddStockFormValues = z.infer<typeof addStockSchema>;
