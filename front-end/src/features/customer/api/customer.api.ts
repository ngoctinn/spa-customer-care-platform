import { FullCustomerProfile } from "@/features/customer/types";
import apiClient from "@/lib/apiClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Lấy danh sách tất cả khách hàng
 */
export async function getCustomers(): Promise<FullCustomerProfile[]> {
  const response = await fetch(`${API_URL}/customers`); // Giả sử endpoint là /customers
  if (!response.ok) {
    throw new Error("Không thể tải danh sách khách hàng");
  }
  return response.json();
}
/**
 * Cập nhật thông tin profile của khách hàng đang đăng nhập
 * @param data Dữ liệu cần cập nhật (full_name, phone)
 */
export async function updateCustomerProfile(
  data: Partial<{ full_name: string; phone: string }>
): Promise<FullCustomerProfile> {
  return apiClient<FullCustomerProfile>("/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
