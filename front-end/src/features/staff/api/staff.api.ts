// src/features/staff/api/staff.api.ts
import apiClient from "@/lib/apiClient";
import { FullStaffProfile } from "@/features/staff/types";
import { StaffFormValues } from "@/features/staff/schemas";
import { UserPublic } from "@/features/user/types";

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
  // Backend chưa có API này, tạm thời trả về mảng rỗng để tránh lỗi
  // Khi có API, bạn có thể thay thế bằng:
  // return apiClient<FullStaffProfile[]>(
  //   `/staff/technicians-by-service/${serviceId}`
  // );
  console.warn(
    `API getTechniciansByService for serviceId=${serviceId} is not implemented on the backend yet.`
  );
  return Promise.resolve([]);
}
