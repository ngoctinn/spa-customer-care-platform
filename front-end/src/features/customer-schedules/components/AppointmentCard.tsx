// src/features/customer-schedules/components/AppointmentCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// --- IMPORT ĐÃ REFACTOR ---
import { Appointment, PaymentStatus } from "@/features/appointment/types";
import { Service } from "@/features/service/types";
import { FullStaffProfile } from "@/features/staff/types";
import { TreatmentPackage, TreatmentPlan } from "@/features/treatment/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CancelAppointmentModal from "@/features/appointment/components/CancelAppointmentModal";
import { getPrimaryImageUrl } from "@/lib/image-utils";

interface AppointmentCardProps {
  appointment: Appointment;
  service: Service;
  technician?: FullStaffProfile;
  treatmentPackage?: TreatmentPackage;
  treatmentPlan?: TreatmentPlan;
  onCancel: (id: string, reason: string) => void;
  onReview: (appointment: Appointment) => void;
  hasReviewed: boolean;
}

const AppointmentCard = ({
  appointment,
  service,
  technician,
  treatmentPackage,
  treatmentPlan,
  onCancel,
  onReview,
  hasReviewed,
}: AppointmentCardProps) => {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // --- LOGIC ĐÃ REFACTOR ---
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "upcoming":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline"; // Thêm một variant mặc định
    }
  };

  const getPaymentStatusInfo = (status?: PaymentStatus) => {
    if (status === "paid") {
      return { text: "Đã thanh toán", variant: "default" as const };
    }
    // Mặc định là "Chưa thanh toán" nếu không phải "paid"
    return { text: "Chưa thanh toán", variant: "destructive" as const };
  };

  const statusInfo = getStatusVariant(appointment.status);
  const paymentStatusInfo = getPaymentStatusInfo(appointment.payment_status);

  const handleConfirmCancel = (reason: string) => {
    onCancel(appointment.id, reason);
    setIsCancelModalOpen(false);
  };

  const primaryImageUrl = getPrimaryImageUrl(
    service.images,
    service.primary_image_id,
    "/images/default-service.jpg"
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            <div>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription>
                {/* Sử dụng start_time và format lại */}
                {new Date(appointment.start_time).toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={statusInfo}>
                {appointment.status === "upcoming" && "Sắp tới"}
                {appointment.status === "completed" && "Đã hoàn thành"}
                {appointment.status === "cancelled" && "Đã hủy"}
                {appointment.status === "checked-in" && "Đã check-in"}
              </Badge>
              <Badge variant={paymentStatusInfo.variant}>
                {paymentStatusInfo.text}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1">
            <Image
              src={primaryImageUrl}
              alt={service.name}
              width={200}
              height={200}
              className="rounded-lg object-cover w-full h-auto aspect-square"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            {treatmentPackage && treatmentPlan && (
              <div className="mb-3 p-2 bg-muted/50 rounded-md text-sm">
                <p className="font-semibold text-primary">
                  Thuộc liệu trình: {treatmentPlan.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  (Gói mua ngày:{" "}
                  {new Date(treatmentPackage.purchase_date).toLocaleDateString(
                    "vi-VN"
                  )}
                  )
                </p>
              </div>
            )}
            <p className="font-semibold">Kỹ thuật viên:</p>
            <p>{technician ? technician.full_name : "Hệ thống tự sắp xếp"}</p>
            <p className="font-semibold mt-2">Thời gian:</p>
            <p>
              {new Date(appointment.start_time).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            {appointment.status === "completed" &&
              appointment.technician_notes && (
                <>
                  <Separator className="my-3" />
                  <p className="font-semibold">Ghi chú từ Kỹ thuật viên:</p>
                  <p className="text-sm text-muted-foreground italic border-l-2 border-primary pl-2 mt-1">
                    {appointment.technician_notes}
                  </p>
                </>
              )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end gap-2">
          {appointment.status === "upcoming" && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsCancelModalOpen(true)}
              >
                Hủy lịch hẹn
              </Button>
              <Button asChild>
                <Link
                  href={`/booking?rescheduleId=${appointment.id}&serviceId=${service.id}`}
                >
                  Thay đổi lịch
                </Link>
              </Button>
            </>
          )}
          {appointment.status === "completed" && !hasReviewed && (
            <Button onClick={() => onReview(appointment)}>Viết đánh giá</Button>
          )}
          {appointment.status === "completed" && hasReviewed && (
            <Button variant="outline" disabled>
              Đã đánh giá
            </Button>
          )}
        </CardFooter>
      </Card>

      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
      />
    </>
  );
};

export default AppointmentCard;
