// src/features/returns/api/return.api.ts
import apiClient from "@/lib/apiClient";
import { CreateReturnPayload, ReturnTransaction } from "../types";

/**
 * Tạo một giao dịch trả hàng mới.
 * @param payload Dữ liệu trả hàng từ client.
 * @returns Promise chứa thông tin giao dịch đã được tạo.
 */
export async function createReturnTransaction(
  payload: CreateReturnPayload
): Promise<ReturnTransaction> {
  return apiClient<ReturnTransaction>("/returns", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
