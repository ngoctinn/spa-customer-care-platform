// src/features/work-schedules/components/ScheduleOverrideForm.tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DateSelectArg } from "@fullcalendar/core";
import { FullStaffProfile } from "@/features/staff/types";
import { useEffect } from "react";
import { toast } from "sonner";
import { createScheduleOverride } from "../api/schedule.api"; // Giả định bạn có hàm API này
import { useMutation, useQueryClient } from "@tanstack/react-query";

const overrideSchema = z.object({
  user_id: z.string().uuid("Vui lòng chọn nhân viên."),
  start_time: z.string().min(1, "Thời gian bắt đầu là bắt buộc."),
  end_time: z.string().min(1, "Thời gian kết thúc là bắt buộc."),
  type: z.enum(["BLOCK", "TASK"]),
  notes: z.string().optional(),
});

type OverrideFormValues = z.infer<typeof overrideSchema>;

interface ScheduleOverrideFormProps {
  selection: DateSelectArg | null;
  staffList: FullStaffProfile[];
  onClose: () => void;
}

export default function ScheduleOverrideForm({
  selection,
  staffList,
  onClose,
}: ScheduleOverrideFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<OverrideFormValues>({
    resolver: zodResolver(overrideSchema),
  });

  useEffect(() => {
    if (selection) {
      const { start, end } = selection;

      form.reset({
        user_id: undefined, // Để trống cho người dùng chọn
        start_time: start.toTimeString().substring(0, 5),
        end_time: end.toTimeString().substring(0, 5),
        type: "BLOCK",
        notes: "",
      });
    }
  }, [selection, form]);

  const createOverrideMutation = useMutation({
    mutationFn: (data: OverrideFormValues & { date: string }) => {
      const { user_id, ...overrideData } = data;
      return createScheduleOverride(user_id, overrideData);
    },
    onSuccess: () => {
      toast.success("Tạo sự kiện ghi đè thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
      onClose();
    },
    onError: (error) =>
      toast.error("Tạo sự kiện thất bại", { description: error.message }),
  });

  const onSubmit = (data: OverrideFormValues) => {
    if (!selection) return;
    const date = selection.startStr.split("T")[0];
    const payload = {
      ...data,
      date: date,
    };
    createOverrideMutation.mutate(payload);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="user_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nhân viên</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân viên..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {staffList.map((staff) => (
                    <SelectItem key={staff.id} value={staff.user.id}>
                      {staff.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bắt đầu</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kết thúc</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại sự kiện</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="BLOCK">
                    Chặn đặt lịch (Họp, nghỉ đột xuất)
                  </SelectItem>
                  <SelectItem value="TASK">
                    Công việc khác (Không chặn lịch)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea placeholder="Nhập lý do hoặc mô tả..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={createOverrideMutation.isPending}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={createOverrideMutation.isPending}>
            {createOverrideMutation.isPending ? "Đang lưu..." : "Lưu sự kiện"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
