// src/features/review/api/review.api.ts
import { Review } from "@/features/review/types";
import apiClient from "@/lib/apiClient";

/**
 * Lấy danh sách tất cả đánh giá
 */
export async function getReviews(): Promise<Review[]> {
  return apiClient<Review[]>("/reviews");
}
