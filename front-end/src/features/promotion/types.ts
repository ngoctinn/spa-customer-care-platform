export interface Promotion {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
  discount_percent: number;
  applicable_service_ids?: string[];
  applicable_plan_ids?: string[];
  gift_product_ids?: string[];
  start_date: string;
  end_date: string;
  status?: "active" | "inactive" | "scheduled";
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}
