import apiClient from "@/lib/apiClient";
import { FullStaffProfile } from "@/features/staff/types";
import {
  StaffFormValues,
  StaffOnboardingFormValues,
  StaffServicesFormValues,
} from "@/features/staff/schemas";

export async function onboardStaff(
  onboardingData: StaffOnboardingFormValues
): Promise<FullStaffProfile> {
  // This function will call a single backend endpoint that handles the complex logic
  // of creating a user, creating a staff profile, assigning roles, services, etc.
  return apiClient<FullStaffProfile>("/staff/onboard", {
    // Assuming a new endpoint like this
    method: "POST",
    body: JSON.stringify(onboardingData),
  });
}

/**
 * Lấy danh sách tất cả nhân viên.
 */
export async function getStaffList(): Promise<FullStaffProfile[]> {
  return apiClient<FullStaffProfile[]>("/staff/");
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
export async function offboardStaff(staffId: string): Promise<any> {
  return apiClient<any>(`/staff/${staffId}/offboard`, {
    method: "POST",
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
