import { FullCustomerProfile } from "@/features/customer/types";
import apiClient from "@/lib/apiClient";
import { CustomerFormValues } from "../schemas";
/**
 * Lấy danh sách tất cả khách hàng
 */
export async function getCustomers(): Promise<FullCustomerProfile[]> {
  return apiClient<FullCustomerProfile[]>("/customers");
}

/**
 * Lấy thông tin chi tiết một khách hàng bằng ID
 * @param customerId ID của khách hàng
 */
export async function getCustomerById(
  customerId: string
): Promise<FullCustomerProfile> {
  return apiClient<FullCustomerProfile>(`/customers/${customerId}`);
}

/**
 * Lấy thông tin profile của khách hàng đang đăng nhập
 */
export async function getCustomerProfile(): Promise<FullCustomerProfile> {
  return apiClient<FullCustomerProfile>("/customers/me/profile");
}

/**
 * Cập nhật thông tin profile của khách hàng đang đăng nhập
 * @param data Dữ liệu cần cập nhật
 */
export async function updateCustomerProfile(
  data: Partial<{ full_name: string; phone_number: string; email: string }>
): Promise<FullCustomerProfile> {
  return apiClient<FullCustomerProfile>("/customers/me/profile", {
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
  data: Partial<{ full_name: string; phone_number: string; note: string }>
): Promise<FullCustomerProfile> {
  // Endpoint và payload đã được cập nhật
  return apiClient<FullCustomerProfile>(`/customers/${customerId}`, {
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
  return apiClient<FullCustomerProfile>("/customers", {
    method: "POST",
    body: JSON.stringify(customerData),
  });
}

/**
 * Vô hiệu hóa một tài khoản khách hàng
 * @param customerId ID của khách hàng cần vô hiệu hóa
 */
export async function deactivateCustomer(customerId: string): Promise<void> {
  return apiClient<void>(`/customers/${customerId}`, {
    method: "DELETE",
  });
}

/**
 * ++ HÀM MỚI: Gửi yêu cầu hợp nhất các hồ sơ khách hàng. ++
 * @param payload Dữ liệu chứa ID khách hàng chính, các ID nguồn và các trường ghi đè.
 */
export async function mergeCustomers(payload: {
  mainCustomerId: string;
  sourceCustomerIds: string[];
  fieldOverrides: Partial<FullCustomerProfile>;
}): Promise<void> {
  return apiClient<void>("/customers/merge", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
