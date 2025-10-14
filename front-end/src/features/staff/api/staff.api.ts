// src/features/staff/api/staff.api.ts

import apiClient from "@/lib/apiClient";
import { FullStaffProfile } from "@/features/staff/types";
import {
  StaffFormValues, // Sẽ cập nhật schema này sau
  StaffServicesFormValues,
} from "@/features/staff/schemas";

/**
 * Lấy danh sách tất cả nhân viên.
 */
export async function getStaffList(): Promise<FullStaffProfile[]> {
  return apiClient<FullStaffProfile[]>("/staff/"); // <-- ENDPOINT MỚI
}

/**
 * Lấy thông tin chi tiết một nhân viên bằng ID.
 * @param staffId ID của Staff Profile
 */
export async function getStaffById(staffId: string): Promise<FullStaffProfile> {
  return apiClient<FullStaffProfile>(`/staff/${staffId}`); // <-- ENDPOINT MỚI
}

/**
 * Thêm một hồ sơ nhân viên mới cho một User đã tồn tại.
 * @param staffData Dữ liệu hồ sơ nhân viên.
 */
export async function addStaff(
  staffData: StaffFormValues & { user_id: string }
): Promise<FullStaffProfile> {
  return apiClient<FullStaffProfile>("/staff/", {
    // <-- ENDPOINT MỚI
    method: "POST",
    body: JSON.stringify(staffData),
  });
}

/**
 * Cập nhật thông tin hồ sơ nhân viên.
 * @param staffId ID của Staff Profile.
 * @param staffData Dữ liệu cần cập nhật.
 */
export async function updateStaff({
  staffId,
  staffData,
}: {
  staffId: string;
  staffData: Partial<StaffFormValues>;
}): Promise<FullStaffProfile> {
  return apiClient<FullStaffProfile>(`/staff/${staffId}`, {
    // <-- ENDPOINT MỚI
    method: "PUT",
    body: JSON.stringify(staffData),
  });
}

/**
 * Cập nhật các dịch vụ mà một nhân viên có thể thực hiện.
 * @param staffId ID của Staff Profile.
 * @param serviceData Dữ liệu chứa mảng các ID dịch vụ.
 */
export async function updateStaffServices(
  staffId: string,
  serviceData: StaffServicesFormValues
): Promise<FullStaffProfile> {
  // <-- ENDPOINT VÀ KIỂU TRẢ VỀ MỚI
  return apiClient<FullStaffProfile>(`/staff/${staffId}/services`, {
    method: "PUT",
    body: JSON.stringify(serviceData),
  });
}

/**
 * Xử lý cho nhân viên nghỉ việc (offboard).
 * @param staffId ID của Staff Profile.
 */
export async function offboardStaff(staffId: string): Promise<void> {
  // LƯU Ý: API yêu cầu thông tin về các cuộc hẹn trong tương lai.
  // Logic này cần được xử lý ở tầng hook trước khi gọi API này.
  // Ở đây chúng ta chỉ định nghĩa hàm gọi API.
  return apiClient<void>(`/staff/${staffId}/offboard`, {
    // <-- ENDPOINT MỚI
    method: "POST",
    // body sẽ được cung cấp bởi hook gọi hàm này
  });
}

/**
 * Lấy danh sách kỹ thuật viên có thể thực hiện một dịch vụ.
 * @param serviceId ID của dịch vụ.
 */
export async function getTechniciansByService(
  serviceId: string
): Promise<FullStaffProfile[]> {
  // Giả định API hỗ trợ query param này
  return apiClient<FullStaffProfile[]>(`/staff?service_id=${serviceId}`);
}

// XÓA các hàm không còn phù hợp: onboardStaff, deleteStaff (thay bằng offboard), updateStaffStatus
