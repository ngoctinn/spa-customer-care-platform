// Chỉnh sửa lại file: front-end/src/features/review/types.ts
import { ImageUrl } from "@/features/shared/types"; // Giả sử bạn có file này

// Định nghĩa các loại có thể được đánh giá
export type ReviewItemType = "product" | "treatment" | "service";

export interface Review {
  id: string;
  appointment_id: string;
  customer_id: string;
  technician_id: string;
  item_id: string; // ID của sản phẩm/dịch vụ/liệu trình
  item_type: ReviewItemType; // Loại của item được đánh giá
  rating: number;
  comment: string;
  images: ImageUrl[];
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

// Dữ liệu để tạo một đánh giá mới
export type NewReviewData = Omit<
  Review,
  "id" | "created_at" | "updated_at" | "is_deleted"
>;
