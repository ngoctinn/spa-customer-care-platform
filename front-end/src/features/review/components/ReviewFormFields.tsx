// src/features/review/components/ReviewFormFields.tsx
"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/features/review/components/StarRating";

export default function ReviewFormFields() {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="rating"
        render={({ field }) => (
          <FormItem className="flex flex-col items-center">
            <FormLabel>Đánh giá của bạn</FormLabel>
            <FormControl>
              <StarRating
                rating={field.value}
                onRatingChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="comment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bình luận (Tùy chọn)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Chia sẻ cảm nhận của bạn về dịch vụ..."
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
