// src/features/work-schedules/components/ScheduleRegistrationForm.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { getDay } from "date-fns";
import { UseMutationResult } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

import { FlexibleSchedule, DefaultSchedulePublic } from "@/features/work-schedules/types";
import MyScheduleList from "./MyScheduleList";
import { format } from "date-fns";

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

interface ScheduleRegistrationFormProps {
  workSchedule: DefaultSchedulePublic[] | undefined;
  mySchedules: FlexibleSchedule[];
  submissionMutation: UseMutationResult<FlexibleSchedule, Error, { start_time: Date; end_time: Date; }, unknown>;
}

export default function ScheduleRegistrationForm({
  workSchedule,
  mySchedules,
  submissionMutation,
}: ScheduleRegistrationFormProps) {
  const [validationResult, setValidationResult] = useState({
    isValid: true,
    message: "",
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

    submissionMutation.mutate(
      { start_time: startDateTime, end_time: endDateTime },
      {
        onSuccess: () => {
          form.reset({ date: null, start_time: "", end_time: "" });
        },
      }
    );
  };

  return (
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
  );
}
