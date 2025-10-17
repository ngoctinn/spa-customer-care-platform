import { User } from "@/features/user/types";
import { LoyaltyTier } from "@/features/loyalty/types";

export interface PurchasedService {
  service_id: string;
  quantity: number;
  purchase_invoice_id: string;
  numberOfGuests?: number;
}

export interface NotificationSettings {
  allow_promotions: boolean;
  allow_reminders: boolean;
}

export interface CustomerPreferences {
  allergies?: string;
  service_notes?: string;
  favorite_technician_ids?: string[];
}

// Cập nhật cấu trúc Customer
export interface Customer {
  id: string;
  phone_number: string | null; // <-- Đổi tên từ phone
  email: string | null;
  full_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  note?: string | null; // <-- Đổi tên từ notes
  avatar_url?: string | null;
  user?: User; // <-- Thông tin user lồng vào

  // Các trường sau có thể thuộc về một đối tượng con, tùy thuộc vào API cuối cùng
  total_appointments?: number;
  last_visit?: Date | null;
  purchased_services?: PurchasedService[];
  preferences?: CustomerPreferences;
  notification_settings?: NotificationSettings;
  loyalty_points?: number;
  debt_amount?: number;
  credit_limit: number;
  joined_date?: Date;
  is_deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Đơn giản hóa FullCustomerProfile để khớp với cấu trúc mới
export type FullCustomerProfile = Customer & {
  loyalty_tier?: LoyaltyTier;
};
