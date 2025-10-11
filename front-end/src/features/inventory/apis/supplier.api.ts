// src/features/inventory/api/supplier.api.ts
import apiClient from "@/lib/apiClient";
import { Supplier } from "@/features/inventory/types";
import { SupplierFormValues } from "@/features/inventory/schemas/supplier.schema";

/**
 * Lấy danh sách tất cả nhà cung cấp.
 */
export async function getSuppliers(): Promise<Supplier[]> {
  return apiClient<Supplier[]>("/suppliers");
}

/**
 * Thêm một nhà cung cấp mới.
 * @param supplierData Dữ liệu từ form.
 */
export async function addSupplier(
  supplierData: SupplierFormValues
): Promise<Supplier> {
  return apiClient<Supplier>("/suppliers", {
    method: "POST",
    body: JSON.stringify(supplierData),
  });
}

/**
 * Cập nhật thông tin nhà cung cấp.
 * @param id ID của nhà cung cấp.
 * @param data Dữ liệu cần cập nhật.
 */
export async function updateSupplier({
  id,
  data,
}: {
  id: string;
  data: Partial<SupplierFormValues>;
}): Promise<Supplier> {
  return apiClient<Supplier>(`/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Xóa một nhà cung cấp.
 * @param id ID của nhà cung cấp.
 */
export async function deleteSupplier(id: string): Promise<void> {
  return apiClient<void>(`/suppliers/${id}`, {
    method: "DELETE",
  });
}
