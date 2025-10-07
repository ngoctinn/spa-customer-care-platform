// src/app/(public)/account/appointments/page.tsx
"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataStateMessage } from "@/components/common/DataStateMessage";

export default function AppointmentHistoryPage() {
  // TODO: Fetch appointment history data using a hook
  const appointments: any[] = []; // Dữ liệu giả

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử đặt hẹn</CardTitle>
        <CardDescription>
          Xem lại các lịch hẹn dịch vụ đã đặt của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <DataStateMessage message="Bạn chưa có lịch hẹn nào." />
        ) : (
          <div>{/* TODO: Render appointment list here */}</div>
        )}
      </CardContent>
    </Card>
  );
}
