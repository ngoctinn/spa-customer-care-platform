// src/features/booking/components/Confirmation.tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BookingState } from "../schemas";
import { useServices } from "@/features/service/hooks/useServices";
import { useTreatmentPlans } from "@/features/treatment/hooks/useTreatmentPlans";

interface ConfirmationProps {
  bookingState: BookingState;
}

export default function Confirmation({ bookingState }: ConfirmationProps) {
  const { data: services } = useServices();
  const { data: treatments } = useTreatmentPlans();

  const selectedItem = bookingState.serviceId
    ? services?.find((s) => s.id === bookingState.serviceId)
    : treatments?.find((t) => t.id === bookingState.treatmentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bước 4: Xác nhận thông tin</CardTitle>
        <CardDescription>
          Vui lòng kiểm tra lại thông tin đặt lịch của bạn trước khi hoàn tất.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="p-4 border rounded-md bg-muted/50">
          <h4 className="font-semibold text-base mb-1">Dịch vụ/Liệu trình:</h4>
          <p className="text-muted-foreground">
            {selectedItem?.name || "Chưa chọn"}
          </p>
        </div>
        <div className="p-4 border rounded-md bg-muted/50">
          <h4 className="font-semibold text-base mb-1">Thời gian:</h4>
          <p className="text-muted-foreground">
            {bookingState.selectedTime} -{" "}
            {bookingState.selectedDate?.toLocaleDateString("vi-VN")}
          </p>
        </div>
        <div className="p-4 border rounded-md bg-muted/50">
          <h4 className="font-semibold text-base mb-1">
            Thông tin khách hàng:
          </h4>
          <p className="text-muted-foreground">
            Tên: {bookingState.customerInfo?.name}
          </p>
          <p className="text-muted-foreground">
            SĐT: {bookingState.customerInfo?.phone}
          </p>
          <p className="text-muted-foreground">
            Email: {bookingState.customerInfo?.email || "Không có"}
          </p>
          {bookingState.customerInfo?.note && (
            <p className="text-muted-foreground">
              Ghi chú: {bookingState.customerInfo?.note}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
