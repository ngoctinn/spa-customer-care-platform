// src/features/work-schedules/hooks/useCheckInStatus.ts
import { useMemo } from "react";
import { isWithinInterval, subMinutes } from "date-fns";
import { FlexibleSchedule, TimeEntry } from "../types";

/**
 * @description Custom hook để tính toán trạng thái check-in của nhân viên.
 * @param mySchedules Danh sách các ca làm việc đã đăng ký của nhân viên.
 * @param timeEntries Danh sách các lần chấm công của nhân viên.
 * @returns { activeTimeEntry, availableScheduleForCheckIn }
 */
export const useCheckInStatus = (
  mySchedules: FlexibleSchedule[],
  timeEntries: TimeEntry[]
) => {
  // Tìm kiếm lần chấm công đang hoạt động (chưa check-out)
  const activeTimeEntry = useMemo(
    () => timeEntries.find((entry) => !entry.check_out_time),
    [timeEntries]
  );

  // Tìm ca làm việc có thể check-in
  const availableScheduleForCheckIn = useMemo(() => {
    const now = new Date();
    return mySchedules.find((schedule) => {
      const startTime = new Date(schedule.start_time);
      const endTime = new Date(schedule.end_time);
      // Cho phép check-in trước 15 phút
      const checkInWindow = { start: subMinutes(startTime, 15), end: endTime };

      return (
        schedule.status === "approved" &&
        !timeEntries.some((entry) => entry.schedule_id === schedule.id) &&
        isWithinInterval(now, checkInWindow)
      );
    });
  }, [mySchedules, timeEntries]);

  return { activeTimeEntry, availableScheduleForCheckIn };
};
