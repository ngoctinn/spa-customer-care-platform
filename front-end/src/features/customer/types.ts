import { UUID } from "crypto";

export interface PurchasedService {
  service_id: UUID;
  quantity: number;
  purchase_invoice_id: UUID;
}

export interface NotificationSettings {
  allow_promotions: boolean;
  allow_reminders: boolean;
}

export interface CustomerPreferences {
  allergies?: string;
  service_notes?: string;
  favorite_technician_ids?: UUID[];
}

export interface Customer {
  id: UUID;
  user_id: UUID;
  name: string;
  phone: string;
  avatar_url?: string;
  total_appointments: number;
  last_visit: Date;
  notes?: string;
  purchased_services?: PurchasedService[];
  preferences?: CustomerPreferences;
  notification_settings?: NotificationSettings;
  loyalty_points?: number;
  rank?: "Bronze" | "Silver" | "Gold"; // Sẽ liên kết với LoyaltyTier
  joined_date: Date;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

// Dùng khi cần kết hợp thông tin từ bảng `users`
export type FullCustomerProfile = Customer & {
  email: string;
  status: "active" | "inactive";
};
