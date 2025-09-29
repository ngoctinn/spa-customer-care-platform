import { UUID } from "crypto";

export interface Review {
  id: UUID;
  appointment_id: UUID;
  customer_id: UUID;
  technician_id: UUID;
  item_id: 
  rating: number;
  comment: string;
  images: ImageUrl[];
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

const itemId = enum type {
  PRODUCT = "product",
  TREATMENT_PLAN = "treatment_plan",
  SERVICE = "service",
}

export type NewReviewData = Omit<Review, "id" | "created_at" | "updated_at" | "is_deleted">;