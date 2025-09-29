import { UUID } from "crypto";

export interface Promotion {
  id: UUID;
  title: string;
  description: string;
  image_url: string;
  discount_percent: number;
  applicable_service_ids?: UUID[];
  applicable_plan_ids?: UUID[];
  gift_product_ids?: UUID[];
  start_date: Date;
  end_date: Date;
  status: "active" | "inactive" | "scheduled";
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}
