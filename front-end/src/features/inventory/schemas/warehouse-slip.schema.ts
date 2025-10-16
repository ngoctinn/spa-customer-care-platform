// src/features/inventory/schemas/warehouse-slip.schema.ts
import { z } from "zod";

const slipItemSchema = z.object({
  product_id: z.string().min(1, "Vui lòng chọn sản phẩm."),
  product_name: z.string(),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0."),
  unit_price: z.number().min(0, "Đơn giá không được âm.").optional(),
  // ++ BỔ SUNG: Thêm stock_quantity vào schema để refine có thể truy cập
  stock_quantity: z.number(),
});

export const importSlipSchema = z.object({
  supplier_id: z.string().min(1, "Vui lòng chọn nhà cung cấp."),
  notes: z.string().optional(),
  items: z.array(slipItemSchema).min(1, "Phiếu phải có ít nhất một sản phẩm."),
});

export const exportSlipSchema = z
  .object({
    notes: z.string().optional(),
    items: z
      .array(slipItemSchema)
      .min(1, "Phiếu phải có ít nhất một sản phẩm."),
  })
  // ++ THAY ĐỔI: Thêm logic refine để kiểm tra tồn kho ++
  .superRefine((data, ctx) => {
    data.items.forEach((item, index) => {
      if (item.quantity > item.stock_quantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Không được vượt quá tồn kho (Tồn: ${item.stock_quantity})`,
          path: [`items`, index, `quantity`], // Trỏ lỗi chính xác vào trường số lượng của item
        });
      }
    });
  });

export type ImportSlipFormValues = z.infer<typeof importSlipSchema>;
export type ExportSlipFormValues = z.infer<typeof exportSlipSchema>;
