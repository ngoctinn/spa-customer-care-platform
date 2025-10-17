// src/features/appointment/apis/appointment.api.ts
import { BookingState } from "@/features/booking/schemas";
import { Appointment } from "@/features/appointment/types";
import apiClient from "@/lib/apiClient";
import { AppointmentFormValues } from "@/features/appointment/schemas";
import { FullStaffProfile } from "@/features/staff/types";
import { buildQueryString } from "@/lib/queryString";

/**
 * Gửi thông tin đặt lịch hẹn mới lên server
 * @param bookingData Dữ liệu từ state của trang đặt lịch
 */
export async function createAppointment(
  bookingData: BookingState
): Promise<Appointment> {
  // Chuyển đổi dữ liệu từ front-end thành định dạng mà back-end mong muốn
  const payload = {
    service_id: bookingData.serviceId,
    treatment_package_id: bookingData.treatmentPackageId,
    treatment_session_id: bookingData.sessionId,
    purchased_service_id: bookingData.purchasedServiceId,
    start_time: new Date(
      `${bookingData.selectedDate?.toISOString().split("T")[0]}T${
        bookingData.selectedTime
      }`
    ),
    // Thông tin khách vãng lai
    guest_name: bookingData.customerInfo?.name,
    guest_phone: bookingData.customerInfo?.phone,
    guest_email: bookingData.customerInfo?.email,
    customer_note: bookingData.customerInfo?.note,
    assigned_staff_ids: bookingData.technicianIds,
  };

  return apiClient<Appointment>("/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// --- CÁC HÀM MỚI DÀNH CHO ADMIN ---

/**
 * Lấy danh sách tất cả lịch hẹn (cho admin)
 */
export async function getAppointments(): Promise<Appointment[]> {
  return apiClient<Appointment[]>("/appointments");
}

/**
 * Lấy thông tin chi tiết một lịch hẹn bằng ID
 * @param id ID của lịch hẹn
 */
export async function getAppointmentById(id: string): Promise<Appointment> {
  return apiClient<Appointment>(`/appointments/${id}`);
}

/**
 * Tạo lịch hẹn mới từ trang admin
 * @param appointmentData Dữ liệu từ form của admin
 */
export async function createAppointmentAdmin(
  appointmentData: AppointmentFormValues
): Promise<Appointment> {
  return apiClient<Appointment>("/appointments/admin-create", {
    method: "POST",
    body: JSON.stringify(appointmentData),
  });
}

/**
 * Cập nhật một lịch hẹn
 * @param id ID của lịch hẹn
 * @param data Dữ liệu cần cập nhật
 */
export async function updateAppointment(
  id: string,
  data: Partial<Appointment | AppointmentFormValues | BookingState>
): Promise<Appointment> {
  // Logic để xử lý payload cho việc reschedule từ booking page
  if ("selectedDate" in data && "selectedTime" in data) {
    const bookingData = data as BookingState;
    const payload = {
      start_time: new Date(
        `${bookingData.selectedDate?.toISOString().split("T")[0]}T${
          bookingData.selectedTime
        }`
      ),
      assigned_staff_ids: bookingData.technicianIds,
      // Giữ lại các thông tin khác nếu cần
    };
    return apiClient<Appointment>(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  // Logic cập nhật thông thường
  return apiClient<Appointment>(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Hủy một lịch hẹn và xử lý các nghiệp vụ liên quan (hoàn tiền, hoàn lượt).
 * @param id ID của lịch hẹn cần hủy.
 * @param reason Lý do hủy.
 */
export async function cancelAppointment({
  id,
  reason,
}: {
  id: string;
  reason: string;
}): Promise<void> {
  return apiClient<void>(`/appointments/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({
      cancellation_reason: reason,
    }),
  });
}

/**
 * Lấy tất cả các lịch hẹn "sắp tới" (upcoming) của một nhân viên.
 * @param technicianId ID của nhân viên.
 */
export async function getUpcomingAppointmentsByTechnician(
  technicianId: string
): Promise<Appointment[]> {
  const query = buildQueryString({
    technician_id: technicianId,
    status: "upcoming",
  });
  return apiClient<Appointment[]>(`/appointments${query}`);
}

/**
 * Lấy danh sách các nhân viên được gợi ý để thay thế cho một lịch hẹn cụ thể.
 * @param appointmentId ID của lịch hẹn cần tìm người thay thế.
 */
export async function getSuggestedTechniciansForAppointment(
  appointmentId: string
): Promise<FullStaffProfile[]> {
  return apiClient<FullStaffProfile[]>(
    `/appointments/${appointmentId}/suggest-technicians`
  );
}

/**
 * Gán một lịch hẹn vào một gói liệu trình hoặc dịch vụ lẻ đã mua.
 */
export async function linkAppointmentToPackage(variables: {
  appointmentId: string;
  packageId?: string;
  purchasedServiceId?: string;
}): Promise<Appointment> {
  const { appointmentId, ...body } = variables;
  return apiClient<Appointment>(`/appointments/${appointmentId}/link-package`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
