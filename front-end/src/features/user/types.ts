export interface Role {
  name: string;
  description: string;
  id: string;
  permissions: Permission[];
  users_count?: number;
}

export interface Permission {
  name: string;
  description: string;
  id: string;
}

export type UserStatus = "active" | "inactive" | "pending_verification";

export interface User {
  email: string;
  id: string;
  is_active: boolean;
  is_deleted: boolean;
  roles: Role[];
  status?: UserStatus;
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export type UserPublic = Pick<User, "id" | "email" | "is_active">;

export interface PermissionGroup {
  [groupName: string]: Permission[];
}
