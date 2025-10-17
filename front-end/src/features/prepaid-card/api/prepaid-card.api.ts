// src/features/prepaid-card/api/prepaid-card.api.ts
import apiClient from "@/lib/apiClient";

interface ApplyPrepaidCardPayload {
  card_code: string;
  total_amount: number;
}

interface ApplyPrepaidCardResponse {
  applicable_amount: number;
  remaining_balance: number;
}

/**
 * Xác thực mã thẻ trả trước và lấy số tiền có thể áp dụng.
 * @param payload - Chứa mã thẻ và tổng số tiền của giỏ hàng/hóa đơn.
 * @returns - Promise chứa số tiền có thể áp dụng và số dư còn lại.
 */
export async function applyPrepaidCard(
  payload: ApplyPrepaidCardPayload
): Promise<ApplyPrepaidCardResponse> {
  return apiClient<ApplyPrepaidCardResponse>("/prepaid-cards/apply", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
