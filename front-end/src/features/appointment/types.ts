export type AppointmentStatus =
  | "upcoming"
  | "completed"
  | "cancelled"
  | "checked-in"
  | "in-progress"
  | "no-show"
  | "paused";

export type PaymentStatus = "paid" | "unpaid" | "partial";

export interface Appointment {
  id: string;
  customer_id: string;
  service_id: string;
  technician_id?: string;
  resource_id?: string; // Phòng hoặc thiết bị
  invoice_id?: string;
  start_time: Date;
  end_time: Date;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  customer_note?: string;
  technician_notes?: string;
  cancellation_reason?: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;

  // Dành cho khách vãng lai không có tài khoản
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;

  // Liên kết đến liệu trình (nếu có)
  treatment_package_id?: string;
  treatment_session_id?: string;
}
