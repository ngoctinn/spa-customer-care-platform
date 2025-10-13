// src/features/schedule/components/WorkScheduleForm.tsx
"use client";

import { useEffect } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  useWorkSchedule,
  useUpdateWorkSchedule,
} from "@/features/work-schedules/hooks/useWorkSchedule";
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
import { DefaultScheduleBase, DefaultScheduleUpdate } from "../types";

// --- Schema mới cho form, khớp với backend ---
const daySchema = z.object({
  day_of_week: z.number(),
  is_active: z.boolean(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
});

const scheduleFormSchema = z.object({
  schedules: z.array(daySchema).length(7, "Phải có đủ 7 ngày trong tuần"),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const dayLabels = [
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
  "Chủ Nhật",
];

export function WorkScheduleForm({ staffId }: { staffId: string }) {
  const { data: workSchedule, isLoading } = useWorkSchedule(staffId);
  const updateMutation = useUpdateWorkSchedule(staffId);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      // Khởi tạo với mảng 7 ngày trống
      schedules: Array.from({ length: 7 }, (_, i) => ({
        day_of_week: i + 1,
        is_active: false,
        start_time: null,
        end_time: null,
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "schedules",
  });

  // Khi có dữ liệu từ API, reset form với dữ liệu đó
  useEffect(() => {
    if (workSchedule) {
      form.reset({ schedules: workSchedule });
    }
  }, [workSchedule, form]);

  const onSubmit = (data: ScheduleFormValues) => {
    // Dữ liệu `data` đã có dạng { schedules: [...] } nên có thể gửi trực tiếp
    updateMutation.mutate(data as DefaultScheduleUpdate);
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
              // Theo dõi trạng thái `is_active` của ngày hiện tại
              const isActive = form.watch(`schedules.${index}.is_active`);
              return (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 p-4 border rounded-md"
                >
                  <FormField
                    control={form.control}
                    name={`schedules.${index}.is_active`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0 md:col-span-1">
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
                  <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
                    <FormField
                      control={form.control}
                      name={`schedules.${index}.start_time`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              value={field.value || ""} // Xử lý giá trị null
                              disabled={!isActive}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <span className="hidden sm:inline">-</span>
                    <FormField
                      control={form.control}
                      name={`schedules.${index}.end_time`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              value={field.value || ""} // Xử lý giá trị null
                              disabled={!isActive}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
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
