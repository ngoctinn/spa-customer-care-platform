// src/features/review/components/AddReviewForm.tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReviewFormValues, reviewFormSchema } from "@/features/review/schemas";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import StarRating from "@/features/review/components/StarRating";
import { Textarea } from "@/components/ui/textarea";
import { MultiImageUploader } from "@/components/common/MultiImageUploader";
import { Button } from "@/components/ui/button";
import { useAddReview } from "../hooks/useReviews";
import { useEffect } from "react";

interface AddReviewFormProps {
  itemId: string;
  itemType: "product" | "service" | "treatment";
  onSuccess?: () => void; // Callback để đóng dialog khi thành công
}

export function AddReviewForm({
  itemId,
  itemType,
  onSuccess,
}: AddReviewFormProps) {
  const addReviewMutation = useAddReview();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: "",
      images: [],
      item_id: itemId,
      item_type: itemType,
    },
  });

  // Reset form khi submit thành công
  useEffect(() => {
    if (addReviewMutation.isSuccess) {
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [addReviewMutation.isSuccess, form, onSuccess]);

  const onSubmit = (data: ReviewFormValues) => {
    addReviewMutation.mutate(data);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
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
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bình luận</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm/dịch vụ..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hình ảnh thực tế (Tùy chọn)</FormLabel>
              <FormControl>
                <MultiImageUploader
                  value={field.value || []}
                  onFilesSelect={(files: File[]) => {
                    field.onChange([...(field.value || []), ...files]);
                  }}
                  onRemoveImage={(imageToRemove) => {
                    const updatedImages = (field.value || []).filter(
                      (img) => img !== imageToRemove
                    );
                    field.onChange(updatedImages);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={addReviewMutation.isPending}>
            {addReviewMutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
