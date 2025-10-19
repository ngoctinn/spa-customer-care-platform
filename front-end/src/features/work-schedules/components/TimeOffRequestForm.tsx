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
              <FormControl>
                <Input
                  type="datetime-local"
                  value={
                    field.value
                      ? new Date(
                          field.value.getTime() -
                            field.value.getTimezoneOffset() * 60000
                        )
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      field.onChange(new Date(e.target.value));
                    }
                  }}
                />
              </FormControl>
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
              <FormControl>
                <Input
                  type="datetime-local"
                  value={
                    field.value
                      ? new Date(
                          field.value.getTime() -
                            field.value.getTimezoneOffset() * 60000
                        )
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      field.onChange(new Date(e.target.value));
                    }
                  }}
                />
              </FormControl>
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
