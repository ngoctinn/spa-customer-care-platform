// src/features/review/api/review.api.ts
import { Review } from "@/features/review/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Lấy danh sách tất cả đánh giá
 */
export async function getReviews(): Promise<Review[]> {
  const response = await fetch(`${API_URL}/reviews`); // Giả sử endpoint là /reviews
  if (!response.ok) {
    throw new Error("Không thể tải danh sách đánh giá");
  }
  return response.json();
}
