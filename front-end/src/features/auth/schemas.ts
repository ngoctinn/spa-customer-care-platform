import { z } from "zod";
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  phoneSchema,
} from "@/lib/schemas"; // <-- Import schema chung
import { Phone } from "lucide-react";
import { min } from "date-fns";

// Sử dụng trực tiếp schema chung
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Mật khẩu không được để trống." }), // Giữ lại vì password ở đây khác
});

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp!",
    path: ["confirmPassword"], // Gắn lỗi vào trường confirmPassword
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordApiSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  token: z.string().min(1, "Token không được để trống."),
});

export const resetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." })
      // chứa ít nhât một số',
      .regex(/[0-9]/, { message: "Mật khẩu phải chứa ít nhất một số." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp!",
    path: ["confirmPassword"],
  });

// Di chuyển từ: src/features/auth/components/otp-form.tsx
export const otpSchema = z.object({
  pin: z.string().min(6, {
    message: "Mã OTP phải có 6 chữ số.",
  }),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." })
      .regex(/[0-9]/, { message: "Mật khẩu phải chứa ít nhất một số." }),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
