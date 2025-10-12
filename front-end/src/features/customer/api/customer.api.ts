import { FullCustomerProfile } from "@/features/customer/types";
import apiClient from "@/lib/apiClient";
import { CustomerFormValues } from "../hooks/useCustomerManagement";

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
 * Lấy thông tin chi tiết một khách hàng bằng ID (cho admin)
 * @param customerId ID của khách hàng
 */
export async function getCustomerById(
  customerId: string
): Promise<FullCustomerProfile> {
  return apiClient<FullCustomerProfile>(`/admin/customers/${customerId}`);
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

/**
 * Admin cập nhật thông tin của một khách hàng bất kỳ
 * @param customerId ID của khách hàng cần cập nhật
 * @param data Dữ liệu cần cập nhật
 */
export async function updateCustomerById(
  customerId: string,
  data: Partial<{ full_name: string; phone: string; notes: string }>
): Promise<FullCustomerProfile> {
  return apiClient<FullCustomerProfile>(`/admin/customers/${customerId}`, {
    // Endpoint cho admin
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Admin thêm một khách hàng mới
 * @param customerData Dữ liệu khách hàng từ form
 */
export async function addCustomer(
  customerData: CustomerFormValues
): Promise<FullCustomerProfile> {
  return apiClient<FullCustomerProfile>("/admin/customers", {
    method: "POST",
    body: JSON.stringify(customerData),
  });
}

/**
 * Vô hiệu hóa một tài khoản khách hàng
 * @param customerId ID của khách hàng cần vô hiệu hóa
 */
export async function deactivateCustomer(customerId: string): Promise<void> {
  return apiClient<void>(`/admin/customers/${customerId}`, {
    method: "DELETE",
  });
}
