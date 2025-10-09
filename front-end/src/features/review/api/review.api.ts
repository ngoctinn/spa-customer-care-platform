// src/features/review/api/review.api.ts
import { NewReviewData, Review } from "@/features/review/types";
import apiClient from "@/lib/apiClient";

/**
 * Lấy danh sách tất cả đánh giá
 */
export async function getReviews(): Promise<Review[]> {
  return apiClient<Review[]>("/reviews");
}

/**
 * Thêm một đánh giá mới
 * @param reviewData Dữ liệu đánh giá mới
 */
export async function createReview(reviewData: NewReviewData): Promise<Review> {
  return apiClient<Review>("/reviews", {
    method: "POST",
    body: JSON.stringify(reviewData),
  });
}
