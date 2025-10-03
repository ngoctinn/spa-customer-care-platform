export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
}
export type UserStatus = "active" | "inactive" | "pending_verification";

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  status: UserStatus;
  last_login?: Date;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  is_superuser: boolean;
  roles: Role[];
}
