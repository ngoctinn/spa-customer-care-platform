// src/features/staff/api/staff.api.ts

import apiClient from "@/lib/apiClient";
import { FullStaffProfile } from "@/features/staff/types";
import {
  StaffFormValues,
  StaffOnboardingFormValues,
  StaffServicesFormValues,
  StaffStatusFormValues,
} from "@/features/staff/schemas";
import { UserPublic } from "@/features/user/types";

/**
 * Gửi toàn bộ thông tin onboarding của nhân viên mới lên server.
 * @param data Dữ liệu từ wizard 4 bước.
 */
export async function onboardStaff(
  data: StaffOnboardingFormValues
): Promise<UserPublic> {
  // API Call duy nhất, backend sẽ xử lý trong một transaction
  return apiClient<UserPublic>("/staff/onboard", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Lấy danh sách tất cả nhân viên (thực chất là tất cả user)
 */
export async function getStaffList(): Promise<FullStaffProfile[]> {
  // Backend trả về danh sách User, ta cần ép kiểu cho phù hợp
  return apiClient<FullStaffProfile[]>("/users/");
}

/**
 * Thêm một nhân viên mới
 * @param staffData Dữ liệu của nhân viên mới từ form
 */
export async function addStaff(
  staffData: StaffFormValues
): Promise<UserPublic> {
  return apiClient<UserPublic>("/users/", {
    method: "POST",
    body: JSON.stringify(staffData),
  });
}
/**
 * Cập nhật thông tin nhân viên
 * @param staffId ID của nhân viên (chính là user_id)
 * @param staffData Dữ liệu cần cập nhật
 */
export async function updateStaff({
  staffId,
  staffData,
}: {
  staffId: string;
  staffData: Partial<StaffFormValues>;
}): Promise<UserPublic> {
  return apiClient<UserPublic>(`/users/${staffId}`, {
    method: "PUT",
    body: JSON.stringify(staffData),
  });
}

/**
 * Xóa (vô hiệu hóa) một nhân viên
 * @param staffId ID của nhân viên (chính là user_id)
 */
export async function deleteStaff(staffId: string): Promise<void> {
  return apiClient<void>(`/users/${staffId}`, {
    method: "DELETE",
  });
}

/**
 * Lấy thông tin chi tiết một nhân viên bằng ID
 * @param staffId ID của nhân viên
 */
export async function getStaffById(staffId: string): Promise<FullStaffProfile> {
  return apiClient<FullStaffProfile>(`/users/${staffId}`);
}

/**
 * Lấy danh sách kỹ thuật viên có thể thực hiện một dịch vụ
 * @param serviceId ID của dịch vụ
 */
export async function getTechniciansByService(
  serviceId: string
): Promise<FullStaffProfile[]> {
  // CẬP NHẬT: Gọi đến endpoint mới của backend thay vì trả về mảng rỗng.
  return apiClient<FullStaffProfile[]>(
    `/staff/technicians-by-service/${serviceId}`
  );
}
/**
 * Cập nhật các dịch vụ (kỹ năng) mà một nhân viên có thể thực hiện.
 * @param staffId ID của nhân viên.
 * @param serviceData Dữ liệu chứa mảng các ID dịch vụ.
 */
export async function updateStaffServices(
  staffId: string,
  serviceData: StaffServicesFormValues
): Promise<void> {
  return apiClient<void>(`/staff/${staffId}/services`, {
    method: "PUT",
    body: JSON.stringify(serviceData),
  });
}

/**
 * Cập nhật trạng thái làm việc của nhân viên (ví dụ: cho nghỉ việc).
 * @param staffId ID của nhân viên.
 * @param statusData Dữ liệu trạng thái mới.
 */
export async function updateStaffStatus(
  staffId: string,
  statusData: StaffStatusFormValues
): Promise<void> {
  return apiClient<void>(`/staff/${staffId}/status`, {
    method: "PUT",
    body: JSON.stringify(statusData),
  });
}
