// src/features/promotion/api/promotion.api.ts
import { Promotion } from "@/features/promotion/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Lấy danh sách tất cả khuyến mãi
 */
export async function getPromotions(): Promise<Promotion[]> {
  const response = await fetch(`${API_URL}/promotions`);
  if (!response.ok) {
    throw new Error("Không thể tải danh sách khuyến mãi");
  }
  return response.json();
}
