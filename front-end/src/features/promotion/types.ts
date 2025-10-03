export interface Promotion {
  id: string;
  title: string;
  description: string;
  image_url: string;
  discount_percent: number;
  applicable_service_ids?: string[];
  applicable_plan_ids?: string[];
  gift_product_ids?: string[];
  start_date: Date;
  end_date: Date;
  status: "active" | "inactive" | "scheduled";
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}
