// src/features/staff/components/onboarding/ProfileStep.tsx
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
import { StaffOnboardingFormValues } from "../../schemas";

export default function ProfileStep() {
  const { control } = useFormContext<StaffOnboardingFormValues>();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="profile.full_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Họ và tên</FormLabel>
            <FormControl>
              <Input placeholder="Nguyễn Văn A" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="profile.phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Số điện thoại (Tùy chọn)</FormLabel>
            <FormControl>
              <Input placeholder="09xxxxxxxx" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Thêm các trường hồ sơ khác tại đây nếu cần */}
    </div>
  );
}
