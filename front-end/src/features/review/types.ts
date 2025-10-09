import { ImageUrl } from "@/features/shared/types"; // Giả sử bạn có file này

export type ReviewItemType = "product" | "treatment" | "service";

export interface Review {
  id: string;
  appointment_id: string;
  customer_id: string;
  technician_id: string;
  item_id: string;
  item_type: ReviewItemType;
  rating: number;
  comment?: string;
  images: ImageUrl[];
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export type NewReviewData = Omit<
  Review,
  "id" | "created_at" | "updated_at" | "is_deleted"
>;
