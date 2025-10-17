// src/features/customer/components/CustomerFormFields.tsx
"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PriceInput from "@/components/common/PriceInput";

export default function CustomerFormFields() {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="full_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Họ và tên</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="phone_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Số điện thoại</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="credit_limit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hạn mức tín dụng (VND)</FormLabel>
            <FormControl>
              <PriceInput name={field.name} label="Hạn mức tín dụng" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="note"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ghi chú nội bộ</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Thêm ghi chú về khách hàng..."
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
