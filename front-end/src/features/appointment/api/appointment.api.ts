// src/features/appointment/api/appointment.api.ts
import { BookingState } from "@/features/booking/schemas";
import { Appointment } from "@/features/appointment/types";
import apiClient from "@/lib/apiClient";

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
    treatment_plan_id: bookingData.treatmentId, // (Nếu có)
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
  };

  return apiClient<Appointment>("/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
