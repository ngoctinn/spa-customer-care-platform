// src/features/resources/api/bed.api.ts
import apiClient from "@/lib/apiClient";
import { Bed } from "@/features/resources/types";
import { BedFormValues } from "@/features/resources/schemas/bed.schema";

/**
 * Lấy danh sách tất cả các giường
 */
export async function getBeds(): Promise<Bed[]> {
  return apiClient<Bed[]>("/resources/beds");
}

/**
 * Thêm một giường mới
 */
export async function addBed(data: BedFormValues): Promise<Bed> {
  return apiClient<Bed>("/resources/beds", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Cập nhật thông tin một giường
 */
export async function updateBed({
  id,
  data,
}: {
  id: string;
  data: Partial<BedFormValues>;
}): Promise<Bed> {
  return apiClient<Bed>(`/resources/beds/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Xóa một giường
 */
export async function deleteBed(id: string): Promise<void> {
  return apiClient<void>(`/resources/beds/${id}`, {
    method: "DELETE",
  });
}
