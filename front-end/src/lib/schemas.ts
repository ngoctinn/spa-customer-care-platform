// src/lib/schemas.ts
import { z } from "zod";

// --- SCHEMAS CHUNG ---

// Dùng cho tên người, tên dịch vụ, tên sản phẩm...
export const nameSchema = z
  .string()
  .trim()
  .min(3, "Tên phải có ít nhất 3 ký tự.");

// Dùng cho các trường mô tả
export const descriptionSchema = z
  .string()
  .trim()
  .min(10, "Mô tả phải có ít nhất 10 ký tự.")
  .optional();

// Dùng cho email đăng nhập, đăng ký, thông tin người dùng
export const emailSchema = z
  .string()
  .email({ message: "Địa chỉ email không hợp lệ." });

// Dùng cho mật khẩu
export const passwordSchema = z
  .string()
  .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." });

// Dùng cho số điện thoại
export const phoneSchema = z.string().regex(/(0[3|5|7|8|9])+([0-9]{8})\b/, {
  message: "Số điện thoại không hợp lệ.",
});

// Dùng cho giá tiền
export const priceSchema = z.number().min(0, "Giá phải là một số dương.");

// Dùng cho việc upload ảnh
export const imageFileSchema = z.any().optional();

// --- SCHEMAS KẾT HỢP CHUNG ---

// Schema cơ bản cho người dùng (khách hàng, nhân viên)
export const personSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  avatar: imageFileSchema,
});

export type PersonFormValues = z.infer<typeof personSchema>;

export const imageSchema = z.object({
  id: z.string(),
  url: z.string().url("URL hình ảnh không hợp lệ."),
  alt_text: z.string().nullable().optional(),
});
