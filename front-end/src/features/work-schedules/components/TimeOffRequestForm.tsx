// src/features/work-schedules/components/TimeOffRequestForm.tsx
"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function TimeOffRequestForm() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6 max-w-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="start_time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Thời gian bắt đầu</FormLabel>
              {/* Kết hợp Calendar và Input Time */}
              <Input
                type="datetime-local"
                onChange={(e) => field.onChange(new Date(e.target.value))}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="end_time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Thời gian kết thúc</FormLabel>
              <Input
                type="datetime-local"
                onChange={(e) => field.onChange(new Date(e.target.value))}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="reason"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lý do</FormLabel>
            <FormControl>
              <Textarea placeholder="Nêu rõ lý do bạn xin nghỉ..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
