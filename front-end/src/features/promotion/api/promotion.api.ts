// src/features/promotion/api/promotion.api.ts
import { Promotion } from "@/features/promotion/types";
import apiClient from "@/lib/apiClient";

/**
 * Lấy danh sách tất cả khuyến mãi
 */
export async function getPromotions(): Promise<Promotion[]> {
  return apiClient<Promotion[]>("/promotions");
}
