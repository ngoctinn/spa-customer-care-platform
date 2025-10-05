// src/features/booking/components/TimeSelection.tsx
"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAvailability } from "@/features/appointment/hooks/useAvailability";
import { Spinner } from "@/components/ui/spinner";

interface TimeSelectionProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  selectedTime: string | undefined;
  onTimeChange: (time: string) => void;
  serviceId?: string | undefined;
  technicianId?: string;
}
export default function TimeSelection({
  serviceId,
  technicianId,
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
}: TimeSelectionProps) {
  const {
    data: availableTimes,
    isLoading,
    isError,
  } = useAvailability(serviceId, selectedDate, technicianId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bước 3: Chọn thời gian</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-3">Chọn ngày</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            className="rounded-md border"
            disabled={(date) =>
              date < new Date(new Date().setHours(0, 0, 0, 0))
            } // Vô hiệu hóa ngày trong quá khứ
          />
        </div>
        {selectedDate && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Chọn giờ</h3>
            {isLoading && (
              <div className="flex items-center justify-center h-40">
                <Spinner className="w-8 h-8" />
              </div>
            )}
            {isError && (
              <p className="text-destructive text-center h-40">
                Không thể tải lịch hẹn. Vui lòng thử lại.
              </p>
            )}
            {!isLoading && !isError && (
              <RadioGroup value={selectedTime} onValueChange={onTimeChange}>
                {availableTimes && availableTimes.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {availableTimes.map((time) => (
                      <div key={time}>
                        <RadioGroupItem
                          value={time}
                          id={time}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={time}
                          className="flex min-h-12 w-full items-center justify-center rounded-md border-2 border-muted bg-popover text-center text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer py-2 px-1"
                        >
                          {time}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 text-center text-muted-foreground">
                    <p>
                      Không có khung giờ trống cho ngày này.
                      <br />
                      Vui lòng chọn một ngày khác.
                    </p>
                  </div>
                )}
              </RadioGroup>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
