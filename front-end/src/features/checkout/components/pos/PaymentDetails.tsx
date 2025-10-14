// src/features/checkout/components/pos/PaymentDetails.tsx
"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { usePosStore } from "@/features/checkout/stores/pos-store";

export function PaymentDetails() {
  const { control } = useFormContext();
  const { total } = usePosStore();

  return (
    <div className="space-y-4">
      <Separator />
      <div className="flex justify-between font-bold text-lg">
        <span>Tổng cộng</span>
        <span>{total.toLocaleString("vi-VN")}đ</span>
      </div>
      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ghi chú đơn hàng</FormLabel>
            <FormControl>
              <Textarea placeholder="Thêm ghi chú..." {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
