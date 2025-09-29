import { FullCustomerProfile } from "@/features/customer/types";

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
