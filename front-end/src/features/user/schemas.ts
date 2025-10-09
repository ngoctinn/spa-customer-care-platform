// src/features/user/schemas.ts
import { z } from "zod";

export const roleFormSchema = z.object({
  name: z.string().min(3, "Tên vai trò phải có ít nhất 3 ký tự."),
  description: z.string().optional(),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

export const permissionsFormSchema = z.object({
  permissionIds: z.array(z.string()).min(1, "Phải chọn ít nhất một quyền."),
});

export type PermissionsFormValues = z.infer<typeof permissionsFormSchema>;
