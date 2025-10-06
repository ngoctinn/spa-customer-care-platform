// src/features/booking/components/BookingSummary.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookingState } from "@/features/booking/schemas";
import { useServiceById } from "@/features/service/hooks/useServices"; // Giả định bạn sẽ tạo hook này
import { useStaffById } from "@/features/staff/hooks/useStaff";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Scissors, User } from "lucide-react";

interface BookingSummaryProps {
  bookingState: BookingState;
  currentStep: number;
}

const SummaryItem = ({
  icon,
  label,
  value,
  isLoading,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  isLoading?: boolean;
}) => {
  if (!value && !isLoading) return null;

  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 h-5 w-5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        {isLoading ? (
          <Skeleton className="h-5 w-32 mt-1" />
        ) : (
          <p className="font-semibold">{value}</p>
        )}
      </div>
    </div>
  );
};

export default function BookingSummary({
  bookingState,
  currentStep,
}: BookingSummaryProps) {
  const { data: service, isLoading: isLoadingService } = useServiceById(
    bookingState.serviceId
  );

  const actualTechnicianId =
    bookingState.technicianId && bookingState.technicianId !== "any"
      ? bookingState.technicianId
      : undefined;

  const { data: technician, isLoading: isLoadingTechnician } =
    useStaffById(actualTechnicianId);

  const formattedDate = bookingState.selectedDate
    ? new Intl.DateTimeFormat("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(bookingState.selectedDate)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tóm tắt đặt lịch</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SummaryItem
          icon={<Scissors />}
          label="Dịch vụ"
          value={service?.name}
          isLoading={isLoadingService}
        />

        {currentStep > 1 && (
          <SummaryItem
            icon={<User />}
            label="Kỹ thuật viên"
            value={technician?.full_name ?? "Bất kỳ ai"}
            isLoading={isLoadingTechnician && !!actualTechnicianId}
          />
        )}

        {currentStep > 2 && (
          <>
            <SummaryItem
              icon={<Calendar />}
              label="Ngày"
              value={formattedDate}
            />
            <SummaryItem
              icon={<Clock />}
              label="Giờ"
              value={bookingState.selectedTime}
            />
          </>
        )}

        {currentStep > 2 && <Separator />}

        <div className="flex justify-between font-bold text-lg">
          <span>Tổng cộng</span>
          <span>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(service?.price ?? 0)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
