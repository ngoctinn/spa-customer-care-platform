// src/app/(admin)/dashboard/schedules/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EventClickArg, DateSelectArg } from "@fullcalendar/core";
import { toast } from "sonner";
import {
  getAdminSchedules,
  approveSchedule,
  rejectSchedule,
  getTimeEntries,
} from "@/features/work-schedules/api/schedule.api";
import { useStaff } from "@/features/staff/hooks/useStaff";
import { PageHeader } from "@/components/common/PageHeader";
import { FullPageLoader } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { FlexibleSchedule } from "@/features/work-schedules/types";
import { ScheduleCalendar } from "@/features/work-schedules/components/ScheduleCalendar";
import { ApprovalDialog } from "@/features/work-schedules/components/ApprovalDialog";
import { statusColors } from "@/features/work-schedules/constants";

export default function ScheduleManagementPage() {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(),
  });
  const [selectedEvent, setSelectedEvent] = useState<FlexibleSchedule | null>(
    null
  );

  const { data: staffList = [], isLoading: isLoadingStaff } = useStaff();
  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["adminSchedules", dateRange],
    queryFn: () =>
      getAdminSchedules(
        dateRange.start.toISOString(),
        dateRange.end.toISOString()
      ),
  });
  // Giả định getTimeEntries đã được triển khai để lấy tất cả time entries
  const { data: timeEntries = [], isLoading: isLoadingTimeEntries } = useQuery({
    queryKey: ["allTimeEntries"],
    queryFn: getTimeEntries,
  });

  const staffMap = useMemo(
    () => new Map(staffList.map((s) => [s.user.id, s.full_name])),
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
      extendedProps: { ...schedule },
    }));
  }, [schedules, staffMap]);

  const { mutate: approve, isPending: isApproving } = useMutation({
    mutationFn: approveSchedule,
    onSuccess: () => {
      toast.success("Đã duyệt ca làm việc.");
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
      setSelectedEvent(null);
    },
    onError: (error) =>
      toast.error("Duyệt thất bại:", { description: error.message }),
  });

  const { mutate: reject, isPending: isRejecting } = useMutation({
    mutationFn: rejectSchedule,
    onSuccess: () => {
      toast.info("Đã từ chối ca làm việc.");
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
      setSelectedEvent(null);
    },
    onError: (error) =>
      toast.error("Từ chối thất bại:", { description: error.message }),
  });

  const handleEventClick = (clickInfo: EventClickArg) => {
    const schedule = clickInfo.event.extendedProps as FlexibleSchedule;
    if (schedule.status === "pending") {
      setSelectedEvent(schedule);
    }
  };

  const isLoading =
    isLoadingStaff || isLoadingSchedules || isLoadingTimeEntries;

  if (isLoading) {
    return <FullPageLoader text="Đang tải dữ liệu lịch làm việc..." />;
  }

  return (
    <>
      <PageHeader
        title="Quản lý Ca làm việc"
        description="Xem, duyệt các ca làm việc và tạo các sự kiện chặn lịch cho nhân viên."
      />
      <Card>
        <CardContent className="p-4">
          <ScheduleCalendar
            events={calendarEvents}
            onEventClick={handleEventClick}
            onDateSelect={(info) => console.log("selected ", info)}
            onDatesSet={(range) => setDateRange(range)}
          />
        </CardContent>
      </Card>

      <ApprovalDialog
        isOpen={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
        schedule={selectedEvent}
        staffName={staffMap.get(selectedEvent?.user_id || "") || ""}
        onApprove={() => selectedEvent && approve(selectedEvent.id)}
        onReject={() => selectedEvent && reject(selectedEvent.id)}
        isApproving={isApproving}
        isRejecting={isRejecting}
      />
    </>
  );
}
