// src/features/booking/components/TimeSelection.tsx
"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimeSelectionProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  selectedTime: string | undefined;
  onTimeChange: (time: string) => void;
}

// Dữ liệu giả lập cho các khung giờ trống, sau này sẽ thay bằng API
const availableTimes = [
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

export default function TimeSelection({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
}: TimeSelectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bước 2: Chọn thời gian</CardTitle>
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
            <RadioGroup value={selectedTime} onValueChange={onTimeChange}>
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
                      className="flex h-12 w-full items-center justify-center rounded-md border-2 border-muted bg-popover text-center text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      {time}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
