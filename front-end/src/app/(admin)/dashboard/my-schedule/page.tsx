"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  submitFlexibleSchedule,
  getTimeEntries,
  checkIn,
  checkOut,
  getMySchedules,
} from "@/features/work-schedules/api/schedule.api";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle,
  XCircle,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FlexibleSchedule } from "@/features/work-schedules/types";
import { format, isWithinInterval, subMinutes, getDay } from "date-fns";
import { useCurrentStaffProfile } from "@/features/staff/hooks/useCurrentStaffProfile";
import { useWorkSchedule } from "@/features/work-schedules/hooks/useWorkSchedule";
import { FullPageLoader } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const scheduleSubmissionSchema = z
  .object({
    date: z
      .date()
      .nullable()
      .refine((val) => val !== null, {
        message: "Vui lòng chọn ngày.",
      }),
    start_time: z
      .string()
      .min(1, "Vui lòng nhập giờ bắt đầu.")
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Định dạng giờ không hợp lệ (HH:mm)."
      ),
    end_time: z
      .string()
      .min(1, "Vui lòng nhập giờ kết thúc.")
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Định dạng giờ không hợp lệ (HH:mm)."
      ),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: "Giờ kết thúc phải sau giờ bắt đầu.",
    path: ["end_time"],
  });

type ScheduleSubmissionValues = z.infer<typeof scheduleSubmissionSchema>;

// Helper Component để hiển thị danh sách ca đã đăng ký
const MyScheduleList = ({ schedules }: { schedules: FlexibleSchedule[] }) => {
  if (schedules.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Chưa có ca nào được đăng ký cho ngày này.
      </p>
    );
  }

  const statusMap = {
    pending: { icon: HelpCircle, color: "text-warning", label: "Chờ duyệt" },
    approved: { icon: CheckCircle, color: "text-success", label: "Đã duyệt" },
    rejected: { icon: XCircle, color: "text-destructive", label: "Đã từ chối" },
  };

  return (
    <div className="space-y-3 mt-4">
      <h3 className="font-semibold">Ca đã đăng ký</h3>
      {schedules.map((schedule) => {
        const status = statusMap[schedule.status];
        return (
          <div
            key={schedule.id}
            className="flex items-center justify-between p-3 border rounded-md bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <status.icon className={`h-5 w-5 ${status.color}`} />
              <div>
                <p className="font-medium">
                  {format(new Date(schedule.start_time), "HH:mm")} -{" "}
                  {format(new Date(schedule.end_time), "HH:mm")}
                </p>
                <Badge variant="outline">{status.label}</Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function EmployeeSchedulePage() {
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [validationResult, setValidationResult] = useState({
    isValid: true,
    message: "",
  });

  // --- Real-time clock ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const form = useForm<ScheduleSubmissionValues>({
    resolver: zodResolver(scheduleSubmissionSchema),
    defaultValues: {
      date: null,
      start_time: "",
      end_time: "",
    },
  });

  const { watch } = form;
  const watchedDate = watch("date");
  const watchedStartTime = watch("start_time");
  const watchedEndTime = watch("end_time");

  useEffect(() => {
    if (!watchedDate || !watchedStartTime || !watchedEndTime || !workSchedule) {
      setValidationResult({ isValid: true, message: "" });
      return;
    }

    // JS getDay(): Sunday - 0... Saturday - 6. Backend day_of_week: Monday - 1...Sunday - 7
    let dayOfWeek = getDay(watchedDate);
    if (dayOfWeek === 0) dayOfWeek = 7; // Convert Sunday

    const fixedDaySchedule = workSchedule.find(
      (day) => day.day_of_week === dayOfWeek
    );

    if (!fixedDaySchedule || !fixedDaySchedule.is_active) {
      setValidationResult({
        isValid: false,
        message: "Bạn không có lịch làm việc cố định vào ngày đã chọn.",
      });
      return;
    }

    if (!fixedDaySchedule.start_time || !fixedDaySchedule.end_time) {
      setValidationResult({
        isValid: false,
        message: "Lịch làm việc cố định cho ngày này không hợp lệ.",
      });
      return;
    }

    if (
      watchedStartTime < fixedDaySchedule.start_time ||
      watchedEndTime > fixedDaySchedule.end_time
    ) {
      setValidationResult({
        isValid: false,
        message: `Ca đăng ký phải nằm trong khung giờ làm việc cố định (${fixedDaySchedule.start_time} - ${fixedDaySchedule.end_time}).`,
      });
      return;
    }

    setValidationResult({ isValid: true, message: "" });
  }, [watchedDate, watchedStartTime, watchedEndTime, workSchedule]);

  const submissionMutation = useMutation({
    mutationFn: submitFlexibleSchedule,
    onSuccess: () => {
      toast.success(
        "Đăng ký ca làm việc thành công! Vui lòng chờ quản lý duyệt."
      );
      form.reset({ date: null, start_time: "", end_time: "" });
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

  const onSubmit = (data: ScheduleSubmissionValues) => {
    if (!data.date) {
      toast.error("Ngày không hợp lệ.");
      return;
    }
    const startDateTime = new Date(data.date);
    const [startHours, startMinutes] = data.start_time.split(":").map(Number);
    startDateTime.setHours(startHours, startMinutes);

    const endDateTime = new Date(data.date);
    const [endHours, endMinutes] = data.end_time.split(":").map(Number);
    endDateTime.setHours(endHours, endMinutes);

    submissionMutation.mutate({
      start_time: startDateTime,
      end_time: endDateTime,
    });
  };

  const activeTimeEntry = useMemo(
    () => timeEntries.find((entry) => !entry.check_out_time),
    [timeEntries]
  );

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

  if (isLoadingStaff || isLoadingSchedule) {
    return <FullPageLoader text="Đang tải dữ liệu lịch làm việc..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Lịch làm việc & Chấm công của tôi" />

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

      <Card>
        <CardHeader>
          <CardTitle>Đăng ký & Xem Lịch</CardTitle>
          <CardDescription>
            Chọn ngày để xem các ca đã đăng ký hoặc tạo đăng ký mới.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col md:grid md:grid-cols-2 gap-8 items-start"
          >
            <div>
              <Controller
                control={form.control}
                name="date"
                render={({ field, fieldState }) => (
                  <>
                    <Calendar
                      mode="single"
                      selected={field.value ?? undefined}
                      onSelect={field.onChange}
                      className="rounded-md border"
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                    />
                    {fieldState.error && (
                      <p className="text-sm text-destructive mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
              <MyScheduleList
                schedules={mySchedules.filter(
                  (s) =>
                    form.getValues("date") &&
                    format(new Date(s.start_time), "yyyy-MM-dd") ===
                      format(form.getValues("date")!, "yyyy-MM-dd")
                )}
              />
            </div>
            <div className="space-y-4 flex-1 w-full">
              <h3 className="font-semibold">Đăng ký ca mới</h3>
              <Controller
                control={form.control}
                name="start_time"
                render={({ field, fieldState }) => (
                  <div>
                    <label className="text-sm font-medium">Giờ bắt đầu</label>
                    <Input type="time" {...field} />
                    {fieldState.error && (
                      <p className="text-sm text-destructive mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="end_time"
                render={({ field, fieldState }) => (
                  <div>
                    <label className="text-sm font-medium">Giờ kết thúc</label>
                    <Input type="time" {...field} />
                    {fieldState.error && (
                      <p className="text-sm text-destructive mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              {!validationResult.isValid && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Đăng ký không hợp lệ</AlertTitle>
                  <AlertDescription>
                    {validationResult.message}
                  </AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                disabled={
                  submissionMutation.isPending || !validationResult.isValid
                }
              >
                {submissionMutation.isPending ? "Đang gửi..." : "Gửi Đăng ký"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
