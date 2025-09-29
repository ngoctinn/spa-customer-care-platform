import { UUID } from "crypto";

export const PERMISSIONS = {
  READ: "read",
  WRITE: "write",
  DELETE: "delete",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const FEATURES = {
  // ... (giữ nguyên danh sách features)
} as const;

export type Feature = (typeof FEATURES)[keyof typeof FEATURES];

export interface Role {
  id: UUID;
  name: string;
  description: string;
  status: "active" | "inactive";
  is_system_role: boolean; // Đánh dấu vai trò hệ thống không thể xóa
  permissions: {
    [key in Feature]?: Permission[];
  };
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}
