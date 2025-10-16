// src/features/checkout/components/pos/PaymentDetails.tsx
"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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
import { Separator } from "@/components/ui/separator";
import { usePosStore } from "@/features/checkout/stores/pos-store";
import PriceInput from "@/components/common/PriceInput";
import { PaymentMethod } from "@/features/checkout/types";

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Tiền mặt" },
  { value: "card", label: "Thẻ" },
  { value: "transfer", label: "Chuyển khoản" },
  { value: "debt", label: "Ghi nợ" },
];

export function PaymentDetails() {
  const { control, watch } = useFormContext();
  const { total } = usePosStore();
  const amountPaid = watch("amount_paid");

  const remainingAmount = total - (amountPaid || 0);

  return (
    <div className="space-y-4">
      <Separator />
      <div className="flex justify-between font-bold text-lg">
        <span>Tổng cộng</span>
        <span>{total.toLocaleString("vi-VN")}đ</span>
      </div>

      <FormField
        control={control}
        name="payment_method"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phương thức thanh toán</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cách thanh toán..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="amount_paid"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Số tiền khách trả</FormLabel>
            <FormControl>
              <PriceInput
                name={field.name}
                label="Số tiền khách trả"
                placeholder="Nhập số tiền..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {amountPaid > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {remainingAmount >= 0 ? "Còn lại" : "Tiền thừa"}
          </span>
          <span className="font-medium">
            {Math.abs(remainingAmount).toLocaleString("vi-VN")}đ
          </span>
        </div>
      )}

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
