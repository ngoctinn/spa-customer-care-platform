// src/features/customer/components/dashboard/AppointmentHistory.tsx
"use client";

import { useCustomerAppointments } from "../../hooks/useCustomerDashboard";
import { FullPageLoader } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataStateMessage } from "@/components/common/DataStateMessage";
import { Appointment } from "@/features/appointment/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { useRouter } from "next/navigation";

const statusVariantMap: Record<
  Appointment["status"],
  "default" | "secondary" | "destructive"
> = {
  upcoming: "default",
  completed: "secondary",
  cancelled: "destructive",
  "in-progress": "default",
  "checked-in": "default",
  "no-show": "destructive",
  paused: "secondary",
};

const AppointmentItem = ({ appointment }: { appointment: Appointment }) => {
  const router = useRouter();

  const handleRebook = () => {
    router.push(`/booking?serviceId=${appointment.service_id}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 rounded-lg border p-4">
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">
          Dịch vụ ID: {appointment.service_id.substring(0, 8)}...
        </p>
        <p className="text-sm text-muted-foreground">
          Ngày:{" "}
          {new Date(appointment.start_time).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </p>
        <p className="text-sm text-muted-foreground">
          Giờ:{" "}
          {new Date(appointment.start_time).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant={statusVariantMap[appointment.status] || "secondary"}>
          {appointment.status}
        </Badge>
        <Button variant="outline" size="sm" onClick={handleRebook}>
          <CalendarPlus className="mr-2 h-4 w-4" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
};

export function AppointmentHistory() {
  const {
    data: appointments = [],
    isLoading,
    isError,
  } = useCustomerAppointments();

  if (isLoading) {
    return <FullPageLoader text="Đang tải lịch sử lịch hẹn..." />;
  }
  if (isError) {
    return (
      <DataStateMessage variant="error" message="Không thể tải dữ liệu." />
    );
  }

  const upcomingAppointments = appointments.filter(
    (a) => a.status === "upcoming"
  );
  const pastAppointments = appointments.filter((a) => a.status !== "upcoming");

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Lịch hẹn sắp tới</CardTitle>
          <CardDescription>
            Các lịch hẹn bạn đã đặt và chưa diễn ra.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((apt) => (
              <AppointmentItem key={apt.id} appointment={apt} />
            ))
          ) : (
            <DataStateMessage message="Bạn không có lịch hẹn nào sắp tới." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử</CardTitle>
          <CardDescription>
            Tất cả các lịch hẹn đã hoàn thành hoặc đã hủy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pastAppointments.length > 0 ? (
            pastAppointments.map((apt) => (
              <AppointmentItem key={apt.id} appointment={apt} />
            ))
          ) : (
            <DataStateMessage message="Chưa có lịch sử lịch hẹn." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
