// src/features/service/api/service.api.ts
import { Service } from "@/features/service/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Lấy danh sách tất cả dịch vụ
 */
export async function getServices(): Promise<Service[]> {
  const response = await fetch(`${API_URL}/services/services`);
  if (!response.ok) {
    throw new Error("Không thể tải danh sách dịch vụ");
  }
  return response.json();
}

/**
 * Lấy thông tin chi tiết một dịch vụ bằng ID
 * @param id ID của dịch vụ
 */
export async function getServiceById(id: string): Promise<Service> {
  const response = await fetch(`${API_URL}/services/services/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Dịch vụ không được tìm thấy.");
    }
    throw new Error("Không thể tải thông tin dịch vụ");
  }
  return response.json();
}
