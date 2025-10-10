// src/app/(admin)/dashboard/schedules/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { EventClickArg, EventContentArg } from "@fullcalendar/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminSchedules,
  approveSchedule,
  rejectSchedule,
} from "@/features/schedule/api/schedule.api";
import { useStaff } from "@/features/staff/hooks/useStaff";
import { PageHeader } from "@/components/common/PageHeader";
import { FullPageLoader } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { FlexibleSchedule } from "@/features/schedule/types";

const statusColors = {
  pending: "bg-warning",
  approved: "bg-success",
  rejected: "bg-destructive",
};

export default function ScheduleManagementPage() {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(),
  });
  const [selectedEvent, setSelectedEvent] = useState<FlexibleSchedule | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: staffList = [], isLoading: isLoadingStaff } = useStaff();
  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["adminSchedules", dateRange],
    queryFn: () =>
      getAdminSchedules(
        dateRange.start.toISOString(),
        dateRange.end.toISOString()
      ),
  });

  const staffMap = useMemo(
    () => new Map(staffList.map((s) => [s.id, s.full_name])),
    [staffList]
  );

  const calendarEvents = useMemo(() => {
    return schedules.map((schedule) => ({
      id: schedule.id,
      title: staffMap.get(schedule.user_id) || "Không rõ",
      start: new Date(schedule.start_time),
      end: new Date(schedule.end_time),
      backgroundColor: statusColors[schedule.status],
      borderColor: statusColors[schedule.status],
      extendedProps: schedule,
    }));
  }, [schedules, staffMap]);

  const approveMutation = useMutation({
    mutationFn: approveSchedule,
    onSuccess: () => {
      toast.success("Đã duyệt ca làm việc.");
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
      setIsDialogOpen(false);
    },
    onError: (error) =>
      toast.error("Duyệt thất bại:", { description: error.message }),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectSchedule,
    onSuccess: () => {
      toast.success("Đã từ chối ca làm việc.");
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
      setIsDialogOpen(false);
    },
    onError: (error) =>
      toast.error("Từ chối thất bại:", { description: error.message }),
  });

  const handleEventClick = (clickInfo: EventClickArg) => {
    const schedule = clickInfo.event.extendedProps as FlexibleSchedule;
    if (schedule.status === "pending") {
      setSelectedEvent(schedule);
      setIsDialogOpen(true);
    }
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    return (
      <div className="p-1">
        <b>{eventInfo.timeText}</b>
        <p className="whitespace-nowrap overflow-hidden text-ellipsis">
          {eventInfo.event.title}
        </p>
      </div>
    );
  };

  if (isLoadingStaff || isLoadingSchedules) {
    return <FullPageLoader text="Đang tải dữ liệu lịch làm việc..." />;
  }

  return (
    <>
      <PageHeader
        title="Quản lý Ca làm việc"
        description="Xem và duyệt các ca làm việc nhân viên đã đăng ký."
      />
      <Card>
        <CardContent className="p-4">
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            initialView="timeGridWeek"
            events={calendarEvents}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            locale="vi"
            buttonText={{
              today: "Hôm nay",
              month: "Tháng",
              week: "Tuần",
              day: "Ngày",
            }}
            allDaySlot={false}
            datesSet={(arg) => {
              setDateRange({ start: arg.start, end: arg.end });
            }}
          />
        </CardContent>
      </Card>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận Ca làm việc</AlertDialogTitle>
            <AlertDialogDescription>
              <p>
                Nhân viên:{" "}
                <strong>{staffMap.get(selectedEvent?.user_id || "")}</strong>
              </p>
              <p>
                Thời gian:{" "}
                <strong>
                  {selectedEvent?.start_time.toLocaleString()} -{" "}
                  {selectedEvent?.end_time.toLocaleString()}
                </strong>
              </p>
              Bạn muốn duyệt hay từ chối ca làm việc này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate(selectedEvent!.id)}
              disabled={rejectMutation.isPending}
            >
              <X className="mr-2 h-4 w-4" /> Từ chối
            </Button>
            <Button
              onClick={() => approveMutation.mutate(selectedEvent!.id)}
              disabled={approveMutation.isPending}
            >
              <Check className="mr-2 h-4 w-4" /> Duyệt
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
