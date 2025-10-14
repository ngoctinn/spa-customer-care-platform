// src/features/dashboard/components/UpcomingAppointments.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppointments } from "@/features/appointment/hooks/useAppointments";
import { useCustomers } from "@/features/customer/hooks/useCustomers";
import { useMemo } from "react";

export function UpcomingAppointments() {
  const { data: appointments = [] } = useAppointments();
  const { data: customers = [] } = useCustomers();

  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers]
  );

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter(
        (apt) =>
          new Date(apt.start_time) > new Date() && apt.status === "upcoming"
      )
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
      .slice(0, 5); // Lấy 5 lịch hẹn gần nhất
  }, [appointments]);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Lịch hẹn sắp tới</CardTitle>
        <CardDescription>
          Bạn có {upcomingAppointments.length} lịch hẹn sắp diễn ra.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map((apt) => {
              const customer = customerMap.get(apt.customer_id);
              const customerName =
                customer?.full_name || apt.guest_name || "Khách vãng lai";
              return (
                <div key={apt.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={customer?.avatar_url || ""}
                      alt="Avatar"
                    />
                    <AvatarFallback>{customerName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {customerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {customer?.email || apt.guest_email}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-sm">
                    {new Date(apt.start_time).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Không có lịch hẹn nào sắp tới.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
