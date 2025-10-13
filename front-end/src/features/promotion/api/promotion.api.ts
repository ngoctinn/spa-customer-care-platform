// src/features/promotion/api/promotion.api.ts
import { Promotion } from "@/features/promotion/types";
import { PromotionFormValues } from "@/features/promotion/schemas";
import apiClient from "@/lib/apiClient";

/**
 * Lấy danh sách tất cả khuyến mãi
 */
export async function getPromotions(): Promise<Promotion[]> {
  return apiClient<Promotion[]>("/promotions");
}

/**
 * Thêm một khuyến mãi mới
 * @param promotionData Dữ liệu khuyến mãi từ form
 */
export async function addPromotion(
  promotionData: PromotionFormValues
): Promise<Promotion> {
  return apiClient<Promotion>("/promotions", {
    method: "POST",
    body: JSON.stringify(promotionData),
  });
}

/**
 * Cập nhật một khuyến mãi
 * @param id ID của khuyến mãi
 * @param data Dữ liệu cập nhật
 */
export async function updatePromotion({
  id,
  data,
}: {
  id: string;
  data: Partial<PromotionFormValues>;
}): Promise<Promotion> {
  return apiClient<Promotion>(`/promotions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Xóa một khuyến mãi
 * @param id ID của khuyến mãi
 */
export async function deletePromotion(id: string): Promise<void> {
  return apiClient<void>(`/promotions/${id}`, {
    method: "DELETE",
  });
}
