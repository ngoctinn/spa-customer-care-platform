// src/features/inventory/apis/warehouse-slip.api.ts
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
 * Lấy chi tiết một phiếu kho bằng ID.
 */
export async function getWarehouseSlipById(id: string): Promise<WarehouseSlip> {
  return apiClient<WarehouseSlip>(`/warehouse-slips/${id}`);
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
 * Cập nhật một phiếu kho.
 * @param id ID của phiếu kho.
 * @param slipData Dữ liệu cập nhật từ form.
 */
export async function updateWarehouseSlip(
  id: string,
  slipData: (ImportSlipFormValues | ExportSlipFormValues) & {
    type: "IMPORT" | "EXPORT";
  }
): Promise<WarehouseSlip> {
  return apiClient<WarehouseSlip>(`/warehouse-slips/${id}`, {
    method: "PUT",
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
