// src/features/appointment/api/appointment.api.ts
import { BookingState } from "@/features/booking/schemas";
import { Appointment } from "@/features/appointment/types";
import apiClient from "@/lib/apiClient";
import { AppointmentFormValues } from "@/features/appointment/schemas";

/**
 * Gửi thông tin đặt lịch hẹn mới lên server
 * @param bookingData Dữ liệu từ state của trang đặt lịch
 */
export async function createAppointment(
  bookingData: BookingState
): Promise<Appointment> {
  // highlight-start
  // Chuyển đổi dữ liệu từ front-end thành định dạng mà back-end mong muốn
  let startTime;
  if (bookingData.selectedDate && bookingData.selectedTime) {
    // Tách giờ và phút từ chuỗi "HH:mm"
    const [hours, minutes] = bookingData.selectedTime.split(":").map(Number);
    // Tạo một đối tượng Date mới từ ngày đã chọn để tránh thay đổi state gốc
    startTime = new Date(bookingData.selectedDate);
    // Đặt giờ, phút, giây, mili giây một cách an toàn
    startTime.setHours(hours, minutes, 0, 0);
  }
  // highlight-end

  const payload = {
    service_id: bookingData.serviceId,
    treatment_plan_id: bookingData.treatmentId, // (Nếu có)
    start_time: startTime, // <-- Sử dụng biến đã xử lý
    // Thông tin khách vãng lai
    guest_name: bookingData.customerInfo?.name,
    guest_phone: bookingData.customerInfo?.phone,
    guest_email: bookingData.customerInfo?.email,
    customer_note: bookingData.customerInfo?.note,
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
 * Tạo lịch hẹn mới từ trang admin
 * @param appointmentData Dữ liệu từ form của admin
 */
export async function createAppointmentAdmin(
  appointmentData: AppointmentFormValues
): Promise<Appointment> {
  return apiClient<Appointment>("/appointments/admin-create", {
    // Giả sử có endpoint riêng
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
  data: Partial<Appointment | AppointmentFormValues>
): Promise<Appointment> {
  return apiClient<Appointment>(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Xóa/hủy một lịch hẹn
 * @param id ID của lịch hẹn cần xóa
 */
export async function deleteAppointment(id: string): Promise<void> {
  return apiClient<void>(`/appointments/${id}`, {
    method: "DELETE",
  });
}
