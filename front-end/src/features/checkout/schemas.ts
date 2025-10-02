import { z } from "zod";

// Schema cho form thông tin nhận hàng
export const shippingSchema = z.object({
  address: z
    .string()
    .trim()
    .min(5, { message: "Địa chỉ phải có ít nhất 5 ký tự." }),
  notes: z.string().optional(),
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;
