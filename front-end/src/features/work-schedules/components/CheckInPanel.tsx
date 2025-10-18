// src/features/work-schedules/components/CheckInPanel.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeEntry } from "@/features/work-schedules/types";
import { Clock, LogIn, LogOut } from "lucide-react";
import { UseMutationResult } from "@tanstack/react-query";
import { FlexibleSchedule } from "../types";

interface CheckInPanelProps {
  currentTime: Date;
  activeTimeEntry: TimeEntry | undefined;
  availableScheduleForCheckIn: FlexibleSchedule | undefined;
  checkInMutation: UseMutationResult<TimeEntry, Error, { schedule_id: string; location?: string | undefined; }, unknown>;
  checkOutMutation: UseMutationResult<TimeEntry, Error, string, unknown>;
}

export default function CheckInPanel({
  currentTime,
  activeTimeEntry,
  availableScheduleForCheckIn,
  checkInMutation,
  checkOutMutation,
}: CheckInPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock /> Chấm công
        </CardTitle>
        <CardDescription>
          Ghi nhận thời gian làm việc thực tế của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <p className="text-4xl font-bold">
          {currentTime.toLocaleTimeString("vi-VN")}
        </p>
        {activeTimeEntry ? (
          <div className="text-center">
            <p>
              Đã check-in lúc:{" "}
              {new Date(activeTimeEntry.check_in_time).toLocaleTimeString(
                "vi-VN"
              )}
            </p>
            <Button
              size="lg"
              className="mt-4"
              onClick={() => checkOutMutation.mutate(activeTimeEntry.id)}
              disabled={checkOutMutation.isPending}
            >
              <LogOut className="mr-2" /> Check Out
            </Button>
          </div>
        ) : (
          <Button
            size="lg"
            onClick={() =>
              checkInMutation.mutate({
                schedule_id: availableScheduleForCheckIn!.id,
              })
            }
            disabled={
              checkInMutation.isPending || !availableScheduleForCheckIn
            }
          >
            <LogIn className="mr-2" /> Check In
          </Button>
        )}
        {!availableScheduleForCheckIn && !activeTimeEntry && (
          <p className="text-sm text-muted-foreground">
            Bạn không có ca làm việc nào được duyệt hôm nay để check-in.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
