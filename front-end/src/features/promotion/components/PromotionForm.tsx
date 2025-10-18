/**
 * @file src/features/promotion/components/PromotionForm.tsx
 * @description Form để thêm và chỉnh sửa khuyến mãi.
 */

"use client";

import { useFormContext } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PromotionFormValues } from "@/features/promotion/types";

export function PromotionForm() {
  const { control } = useFormContext<PromotionFormValues>();

  return (
    <div className="space-y-4 py-2 pb-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tên khuyến mãi</FormLabel>
            <FormControl>
              <Input placeholder="V.d: Giảm giá 30/4" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="discount_percentage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phần trăm giảm giá</FormLabel>
            <FormControl>
              <Input type="number" placeholder="V.d: 20" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="date_range"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Thời gian hiệu lực</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value.from && "text-muted-foreground"
                    )}
                  >
                    {field.value.from ? (
                      <>
                        {format(field.value.from, "dd/MM/yyyy")} -{" "}
                        {field.value.to ? format(field.value.to, "dd/MM/yyyy") : "..."}
                      </>
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={field.value.from}
                  selected={{ from: field.value.from, to: field.value.to }}
                  onSelect={(range) => {
                    if (range) {
                      field.onChange(range);
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mô tả (tùy chọn)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Mô tả chi tiết về chương trình khuyến mãi..."
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}