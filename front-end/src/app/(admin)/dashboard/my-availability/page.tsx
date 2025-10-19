"use client";

import { useMemo } from "react";
import { ScheduleForm } from "@/features/event-types/components/ScheduleForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentStaffProfile } from "@/features/staff/hooks/useCurrentStaffProfile";
import { useWorkSchedule } from "@/features/work-schedules/hooks/useWorkSchedule";
import { FullPageLoader } from "@/components/ui/spinner";
import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants";

export default function SchedulePage() {
  const { staffProfile, isLoading: isLoadingProfile } = useCurrentStaffProfile();
  const { data: workSchedule, isLoading: isLoadingSchedule } = useWorkSchedule(
    staffProfile?.user.id || ""
  );

  const scheduleForForm = useMemo(() => {
    if (!workSchedule) return undefined;

    const availabilities = workSchedule
      .filter((day) => day.is_active && day.start_time && day.end_time)
      .map((day) => ({
        dayOfWeek: DAYS_OF_WEEK_IN_ORDER[day.day_of_week - 1],
        startTime: day.start_time!.substring(0, 5), // HH:mm:ss -> HH:mm
        endTime: day.end_time!.substring(0, 5),
      }));

    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilities,
    };
  }, [workSchedule]);

  if (isLoadingProfile || isLoadingSchedule) {
    return <FullPageLoader text="Đang tải lịch làm việc..." />;
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Lịch làm việc cá nhân</CardTitle>
      </CardHeader>
      <CardContent>
        {scheduleForForm ? (
          <ScheduleForm schedule={scheduleForForm} />
        ) : (
          <p className="text-muted-foreground text-center">
            Không tìm thấy thông tin lịch làm việc.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
