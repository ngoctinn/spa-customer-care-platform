// src/features/customer-schedules/components/AppointmentDetailPanel.tsx
"use client";

// --- IMPORT ĐÃ REFACTOR ---
import { Button } from "@/components/ui/button";
import { Appointment } from "@/features/appointment/types";
import { Service } from "@/features/service/types";
import { FullStaffProfile } from "@/features/staff/types";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Review } from "@/features/review/types";

interface AppointmentDetailPanelProps {
  appointment: Appointment;
  services: Service[];
  staff: FullStaffProfile[];
  reviews: Review[];
  onClose: () => void;
  onCancelAppointment: (id: string, reason: string) => void;
  onWriteReview: (appointment: Appointment) => void;
}

export default function AppointmentDetailPanel({
  appointment,
  services,
  staff,
  reviews,
  onClose,
  onCancelAppointment,
  onWriteReview,
}: AppointmentDetailPanelProps) {
  const service = services.find((s) => s.id === appointment.service_id);
  const technician = staff.find(
    (t) => t.id === appointment.assigned_staff_ids?.[0]
  );

  if (!service) return null;

  // --- LOGIC ĐÃ REFACTOR ---
  // Kiểm tra xem lịch hẹn này đã được đánh giá hay chưa
  const hasReviewed = reviews.some((r) => r.appointment_id === appointment.id);

  return (
    <div className="bg-card border rounded-lg h-full flex flex-col p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Chi tiết Lịch hẹn</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      <div className="space-y-4 my-4 flex-grow">
        <p className="font-bold text-primary">{service.name}</p>
        <div>
          <p className="text-sm text-muted-foreground">Thời gian</p>
          <p className="font-medium">
            {new Date(appointment.start_time).toLocaleString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            - {new Date(appointment.start_time).toLocaleDateString("vi-VN")}
          </p>
        </div>
        {technician && (
          <div>
            <p className="text-sm text-muted-foreground">Kỹ thuật viên</p>
            <p className="font-medium">{technician.full_name}</p>
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">Thanh toán</p>
          <Badge
            variant={
              appointment.payment_status === "paid" ? "default" : "destructive"
            }
          >
            {appointment.payment_status === "paid"
              ? "Đã thanh toán"
              : "Chưa thanh toán"}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 mt-auto">
        {appointment.status === "upcoming" && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={() =>
              onCancelAppointment(
                appointment.id,
                "Customer cancelled from detail panel"
              )
            }
          >
            Hủy lịch
          </Button>
        )}
        {appointment.status === "completed" && !hasReviewed && (
          <Button className="w-full" onClick={() => onWriteReview(appointment)}>
            Viết đánh giá
          </Button>
        )}
        {appointment.status === "completed" && hasReviewed && (
          <Button className="w-full" disabled>
            Đã đánh giá
          </Button>
        )}
      </div>
    </div>
  );
}
