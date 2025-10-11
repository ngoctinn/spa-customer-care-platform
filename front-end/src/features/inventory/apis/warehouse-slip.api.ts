// src/features/inventory/api/warehouse-slip.api.ts
import apiClient from "@/lib/apiClient";
import { WarehouseSlip } from "@/features/inventory/types";
import {
  ImportSlipFormValues,
  ExportSlipFormValues,
} from "@/features/inventory/schemas/warehouse-slip.schema";

/**
 * Lấy danh sách tất cả phiếu kho.
 */
export async function getWarehouseSlips(): Promise<WarehouseSlip[]> {
  return apiClient<WarehouseSlip[]>("/warehouse-slips");
}

/**
 * Tạo một phiếu kho mới (nhập hoặc xuất).
 * @param slipData Dữ liệu từ form.
 */
export async function createWarehouseSlip(
  slipData: (ImportSlipFormValues | ExportSlipFormValues) & {
    type: "IMPORT" | "EXPORT";
  }
): Promise<WarehouseSlip> {
  return apiClient<WarehouseSlip>("/warehouse-slips", {
    method: "POST",
    body: JSON.stringify(slipData),
  });
}

/**
 * Xóa một phiếu kho.
 * @param slipId ID của phiếu kho cần xóa.
 */
export async function deleteWarehouseSlip(slipId: string): Promise<void> {
  return apiClient<void>(`/warehouse-slips/${slipId}`, {
    method: "DELETE",
  });
}
