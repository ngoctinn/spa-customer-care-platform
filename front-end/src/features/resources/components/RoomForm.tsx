// src/features/resources/components/RoomForm.tsx
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

export default function RoomForm() {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tên phòng</FormLabel>
            <FormControl>
              <Input placeholder="VD: Phòng VIP 1" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mô tả (Tùy chọn)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Mô tả về phòng, vị trí, trang thiết bị..."
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
