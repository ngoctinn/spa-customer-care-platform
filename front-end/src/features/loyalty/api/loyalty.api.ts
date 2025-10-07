// src/features/loyalty/api/loyalty.api.ts
import apiClient from "@/lib/apiClient";
import { LoyaltySettings } from "@/features/loyalty/types";
import { LoyaltySettingsFormValues } from "@/features/loyalty/schemas";
/**
 * Lấy cài đặt hệ thống khách hàng thân thiết
 */
export async function getLoyaltySettings(): Promise<LoyaltySettings> {
  // Giả sử endpoint là /loyalty/settings
  return apiClient<LoyaltySettings>("/loyalty/settings");
}

/**
 * Cập nhật cài đặt hệ thống khách hàng thân thiết
 * @param settings Dữ liệu cài đặt cần cập nhật
 */
export async function updateLoyaltySettings(
  settings: LoyaltySettingsFormValues
): Promise<LoyaltySettings> {
  return apiClient<LoyaltySettings>("/loyalty/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}
