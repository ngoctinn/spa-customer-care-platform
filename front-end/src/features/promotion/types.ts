// src/features/promotion/types.ts
export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount_percent: number;
  start_date: string; // ISO 8601 date string
  end_date: string; // ISO 8601 date string
  is_active: boolean;
  image_url?: string | null;
  applicable_service_ids?: string[];
  applicable_plan_ids?: string[];
  gift_product_ids?: string[];
  status?: "active" | "inactive" | "scheduled";
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}
