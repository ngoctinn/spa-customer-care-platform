// src/features/customer-schedules/components/InteractiveCalendar.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";

// --- IMPORT ĐÃ REFACTOR ---
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Appointment } from "@/features/appointment/types";
import { Service } from "@/features/service/types";

interface InteractiveCalendarProps {
  appointments: Appointment[];
  services: Service[];
  onSelectAppointment: (appointment: Appointment) => void;
  onCreateAppointment: (date: Date) => void;
}

// Component con để hiển thị chú thích
const CalendarLegend = () => (
  <Card className="mt-4">
    <CardContent className="p-3">
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary"></div>
          <span>Sắp tới</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-success"></div>
          <span>Đã hoàn thành</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-destructive"></div>
          <span>Đã hủy</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function InteractiveCalendar({
  appointments,
  services,
  onSelectAppointment,
  onCreateAppointment,
}: InteractiveCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Ghi nhớ những ngày có lịch hẹn để hiển thị dấu chấm
  const appointmentDates = useMemo(
    () => appointments.map((app) => new Date(app.start_time)),
    [appointments]
  );

  // Lọc danh sách lịch hẹn tương ứng với ngày đã chọn
  const selectedDayAppointments = appointments
    .filter(
      (app) => new Date(app.start_time).toDateString() === date?.toDateString()
    )
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

  // --- LOGIC ĐÃ REFACTOR ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "after:bg-primary";
      case "completed":
        return "after:bg-success";
      case "cancelled":
        return "after:bg-destructive";
      default:
        return "after:bg-muted";
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <Card className="w-full items-center p-2 md:p-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="p-0"
          modifiers={{ withAppointments: appointmentDates }}
          modifiersClassNames={{
            withAppointments: "has-appointment", // Class này cần được định nghĩa trong global CSS
          }}
        />
      </Card>

      <Card className="flex-grow flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h4 className="font-semibold">
            Lịch hẹn ngày {date?.toLocaleDateString("vi-VN")}
          </h4>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => date && onCreateAppointment(date)}
            disabled={!date}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="flex-grow">
          <div className="p-4 space-y-3">
            {selectedDayAppointments.length > 0 ? (
              selectedDayAppointments.map((app) => {
                const service = services.find((s) => s.id === app.service_id);
                return (
                  <button
                    key={app.id}
                    onClick={() => onSelectAppointment(app)}
                    className={cn(
                      "w-full text-left bg-muted after:bg-primary/70 relative rounded-md p-3 pl-8 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1.5 after:rounded-full transition-colors hover:bg-accent",
                      getStatusColor(app.status)
                    )}
                  >
                    <div className="font-semibold">
                      {service?.name || "Dịch vụ"}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(app.start_time).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center pt-8">
                Không có lịch hẹn.
              </p>
            )}
          </div>
        </ScrollArea>
        <CalendarLegend />
      </Card>
    </div>
  );
}
