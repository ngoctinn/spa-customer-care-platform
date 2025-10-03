import { User } from "@/features/user/types";

export interface PurchasedService {
  service_id: string;
  quantity: number;
  purchase_invoice_id: string;
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

export interface Customer {
  id: string;
  user_id: string;
  total_appointments: number;
  last_visit: Date | null;
  notes?: string;
  purchased_services?: PurchasedService[];
  preferences?: CustomerPreferences;
  notification_settings?: NotificationSettings;
  loyalty_points?: number;
  rank?: string;
  joined_date: Date;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export type FullCustomerProfile = Omit<User, "roles"> & {
  customer_profile: Customer; // Lồng thông tin customer vào
};
