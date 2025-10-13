// src/features/staff/components/onboarding/ScheduleStep.tsx
"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { StaffOnboardingFormValues } from "../../schemas";
import { Card, CardContent } from "@/components/ui/card";

const dayLabels = [
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
  "Chủ Nhật",
];

export default function ScheduleStep() {
  const { control, watch } = useFormContext<StaffOnboardingFormValues>();

  const { fields } = useFieldArray({
    control,
    name: "schedule.schedules",
  });

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {fields.map((field, index) => {
          const isActive = watch(`schedule.schedules.${index}.is_active`);
          return (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-4 items-center gap-4"
            >
              <FormField
                control={control}
                name={`schedule.schedules.${index}.is_active`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0 md:col-span-1">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-bold">
                      {dayLabels[index]}
                    </FormLabel>
                  </FormItem>
                )}
              />
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
                <FormField
                  control={control}
                  name={`schedule.schedules.${index}.start_time`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          value={field.value || ""}
                          disabled={!isActive}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <span className="hidden sm:inline text-center">-</span>
                <FormField
                  control={control}
                  name={`schedule.schedules.${index}.end_time`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          value={field.value || ""}
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
    </Card>
  );
}
