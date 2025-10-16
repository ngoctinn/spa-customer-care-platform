// src/features/resources/components/BedForm.tsx
"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { useRooms } from "@/features/resources/hooks/useResources";

export default function BedForm() {
  const { control } = useFormContext();
  const { data: rooms = [], isLoading: isLoadingRooms } = useRooms();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tên / Mã giường</FormLabel>
            <FormControl>
              <Input placeholder="VD: Giường G01" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="room_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Thuộc phòng</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isLoadingRooms}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng cho giường..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {isLoadingRooms ? (
                  <SelectItem value="loading" disabled>
                    Đang tải danh sách phòng...
                  </SelectItem>
                ) : (
                  rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
