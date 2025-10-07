// src/features/customer/api/customer-dashboard.api.ts
import { Appointment } from "@/features/appointment/types";
import { TreatmentPackage } from "@/features/treatment/types";
import apiClient from "@/lib/apiClient";

/**
 * Lấy lịch sử lịch hẹn của khách hàng đang đăng nhập.
 * @returns Danh sách các lịch hẹn.
 */
export async function getCustomerAppointments(): Promise<Appointment[]> {
  // Giả định backend có endpoint này để trả về lịch hẹn của user "me"
  return apiClient<Appointment[]>("/customers/me/appointments");
}

/**
 * Lấy các gói liệu trình đã mua của khách hàng đang đăng nhập.
 * @returns Danh sách các gói liệu trình.
 */
export async function getCustomerTreatmentPackages(): Promise<
  TreatmentPackage[]
> {
  // Giả định backend có endpoint này
  return apiClient<TreatmentPackage[]>("/customers/me/treatment-packages");
}
