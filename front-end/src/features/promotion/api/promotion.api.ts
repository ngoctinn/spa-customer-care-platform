// src/features/promotion/api/promotion.api.ts
import { Promotion } from "@/features/promotion/types";
import apiClient, { ApiError } from "@/lib/apiClient";

/**
 * Lấy danh sách tất cả khuyến mãi
 */
export async function getPromotions(): Promise<Promotion[]> {
  try {
    return await apiClient<Promotion[]>("/promotions");
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 204)) {
      // Backend chưa hỗ trợ endpoint, trả về danh sách rỗng để UI xử lý gracefully
      return [];
    }

    throw error;
  }
}
