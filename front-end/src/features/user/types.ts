export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
  users_count?: number;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  group: string;
}
export type UserStatus = "active" | "inactive" | "pending_verification";

export interface User {
  id: string;
  email: string;
  phone?: string | null;
  full_name: string;
  avatar_url?: string;
  status: UserStatus;
  last_login?: Date;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  is_superuser: boolean;
  is_email_verified: boolean;
  roles: Role[];
}
export type UserPublic = Pick<
  User,
  "id" | "email" | "phone" | "full_name" | "is_active" | "is_superuser"
>;

export interface PermissionGroup {
  [groupName: string]: Permission[];
}
