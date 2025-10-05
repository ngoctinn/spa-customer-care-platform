// src/features/schedule/components/WorkScheduleForm.tsx
"use client";

import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useWorkSchedule,
  useUpdateWorkSchedule,
} from "@/features/schedule/hooks/useWorkSchedule";
import { FullPageLoader } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { WorkSchedule } from "@/features/schedule/types";

const daySchema = z.object({
  is_active: z.boolean(),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "HH:mm"),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "HH:mm"),
});

const scheduleSchema = z.object({
  schedule: z.array(daySchema),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

const dayLabels = [
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
  "Chủ Nhật",
];
const dayKeys = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function WorkScheduleForm({ staffId }: { staffId: string }) {
  const { data: workSchedule, isLoading } = useWorkSchedule(staffId);
  const updateMutation = useUpdateWorkSchedule(staffId);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "schedule",
  });

  useEffect(() => {
    if (workSchedule) {
      // Chuyển đổi dữ liệu từ API sang dạng mảng cho useFieldArray
      const scheduleArray = dayKeys.map(
        (key) =>
          workSchedule.schedule[key as keyof typeof workSchedule.schedule]
      );
      form.reset({ schedule: scheduleArray });
    }
  }, [workSchedule, form]);

  const onSubmit = (data: ScheduleFormValues) => {
    // Chuyển đổi lại dữ liệu từ mảng về object trước khi gửi đi
    const scheduleObject = data.schedule.reduce((acc, dayData, index) => {
      const dayKey = dayKeys[index] as keyof WorkSchedule["schedule"];
      acc[dayKey] = dayData;
      return acc;
    }, {} as WorkSchedule["schedule"]);

    updateMutation.mutate({ schedule: scheduleObject });
  };

  if (isLoading) {
    return <FullPageLoader text="Đang tải lịch làm việc..." />;
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Lịch Cố Định</CardTitle>
            <CardDescription>
              Chọn ngày làm việc và thiết lập khung giờ. Bỏ chọn để đánh dấu
              ngày nghỉ.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => {
              const isActive = form.watch(`schedule.${index}.is_active`);
              return (
                <div
                  key={field.id}
                  className="grid grid-cols-4 items-center gap-4 p-4 border rounded-md"
                >
                  <FormField
                    control={form.control}
                    name={`schedule.${index}.is_active`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-bold text-base">
                          {dayLabels[index]}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`schedule.${index}.start_time`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="time" {...field} disabled={!isActive} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span>-</span>
                  <FormField
                    control={form.control}
                    name={`schedule.${index}.end_time`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="time" {...field} disabled={!isActive} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              );
            })}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Đang lưu..." : "Lưu Thay Đổi"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
}
