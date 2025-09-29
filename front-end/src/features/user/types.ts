import { UUID } from "crypto";

export type UserRole =
  | "customer"
  | "receptionist"
  | "technician"
  | "manager"
  | "admin";
export type UserStatus = "active" | "inactive" | "pending_verification";

export interface User {
  id: UUID;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  last_login?: Date;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}
