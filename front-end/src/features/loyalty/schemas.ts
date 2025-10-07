// src/features/loyalty/schemas.ts
import { z } from "zod";

export const loyaltyTierSchema = z.object({
  id: z.string().optional(), // ID có thể có hoặc không (khi tạo mới)
  name: z.string().min(2, "Tên cấp bậc phải có ít nhất 2 ký tự."),
  point_goal: z.number().min(0, "Điểm không được âm."),
  color_hex: z.string().regex(/^#[0-9A-F]{6}$/i, "Mã màu hex không hợp lệ."),
  benefits_description: z
    .string()
    .min(10, "Mô tả quyền lợi phải có ít nhất 10 ký tự."),
});

export const loyaltySettingsSchema = z.object({
  points_per_vnd: z.number().min(1, "Tỷ lệ phải lớn hơn 0."),
  tiers: z.array(loyaltyTierSchema).min(1, "Phải có ít nhất một cấp bậc."),
});

export type LoyaltySettingsFormValues = z.infer<typeof loyaltySettingsSchema>;
