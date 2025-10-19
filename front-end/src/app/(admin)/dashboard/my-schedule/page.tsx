"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { FullPageLoader } from "@/components/ui/spinner";

import {
  submitFlexibleSchedule,
  getTimeEntries,
  checkIn,
  checkOut,
  getMySchedules,
} from "@/features/work-schedules/api/schedule.api";
import { useCurrentStaffProfile } from "@/features/staff/hooks/useCurrentStaffProfile";
import { useWorkSchedule } from "@/features/work-schedules/hooks/useWorkSchedule";

import CheckInPanel from "@/features/work-schedules/components/CheckInPanel";
import ScheduleRegistrationForm from "@/features/work-schedules/components/ScheduleRegistrationForm";
import { useCheckInStatus } from "@/features/work-schedules/hooks/useCheckInStatus";

export default function EmployeeSchedulePage() {
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Data Fetching
  const { staffProfile, isLoading: isLoadingStaff } = useCurrentStaffProfile();
  const { data: workSchedule, isLoading: isLoadingSchedule } = useWorkSchedule(
    staffProfile?.id || ""
  );
  const { data: timeEntries = [] } = useQuery({
    queryKey: ["myTimeEntries"],
    queryFn: getTimeEntries,
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { data: mySchedules = [] } = useQuery({
    queryKey: ["mySchedules", todayStart.toISOString()],
    queryFn: () =>
      getMySchedules(todayStart.toISOString(), todayEnd.toISOString()),
  });

  // Mutations
  const submissionMutation = useMutation({
    mutationFn: submitFlexibleSchedule,
    onSuccess: () => {
      toast.success(
        "Đăng ký ca làm việc thành công! Vui lòng chờ quản lý duyệt."
      );
      queryClient.invalidateQueries({ queryKey: ["mySchedules"] });
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
    },
    onError: (error) =>
      toast.error("Đăng ký thất bại", { description: error.message }),
  });

  const checkInMutation = useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      toast.success("Check-in thành công!");
      queryClient.invalidateQueries({ queryKey: ["myTimeEntries"] });
    },
    onError: (error) =>
      toast.error("Check-in thất bại", { description: error.message }),
  });

  const checkOutMutation = useMutation({
    mutationFn: (timeEntryId: string) => checkOut(timeEntryId, {}),
    onSuccess: () => {
      toast.success("Check-out thành công!");
      queryClient.invalidateQueries({ queryKey: ["myTimeEntries"] });
    },
    onError: (error) =>
      toast.error("Check-out thất bại", { description: error.message }),
  });

  const { activeTimeEntry, availableScheduleForCheckIn } = useCheckInStatus(
    mySchedules,
    timeEntries
  );

  if (isLoadingStaff || isLoadingSchedule) {
    return <FullPageLoader text="Đang tải dữ liệu lịch làm việc..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Lịch làm việc & Chấm công của tôi" />

      <CheckInPanel
        currentTime={currentTime}
        activeTimeEntry={activeTimeEntry}
        availableScheduleForCheckIn={availableScheduleForCheckIn}
        checkInMutation={checkInMutation}
        checkOutMutation={checkOutMutation}
      />

      <ScheduleRegistrationForm
        workSchedule={workSchedule}
        mySchedules={mySchedules}
        submissionMutation={submissionMutation}
      />
    </div>
  );
}
