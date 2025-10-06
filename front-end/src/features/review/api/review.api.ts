// src/features/review/api/review.api.ts
import { Review } from "@/features/review/types";
import apiClient from "@/lib/apiClient";
import { ReviewFormValues } from "../schemas";
import { appendFormDataValue, splitImages } from "@/lib/form-data-utils";

/**
 * Lấy danh sách tất cả đánh giá
 */
export async function getReviews(): Promise<Review[]> {
  return apiClient<Review[]>("/reviews");
}

/**
 * Thêm một đánh giá mới
 * @param reviewData Dữ liệu đánh giá từ form
 */
export async function addReview(reviewData: ReviewFormValues): Promise<Review> {
  const formData = new FormData();

  appendFormDataValue(formData, "rating", reviewData.rating);
  appendFormDataValue(formData, "comment", reviewData.comment);
  appendFormDataValue(formData, "item_id", reviewData.item_id);
  appendFormDataValue(formData, "item_type", reviewData.item_type);

  // Xử lý hình ảnh
  if (reviewData.images) {
    const { files } = splitImages(reviewData.images);
    files.forEach((file) => {
      formData.append("images", file);
    });
  }

  return apiClient<Review>("/reviews", {
    method: "POST",
    body: formData,
  });
}
