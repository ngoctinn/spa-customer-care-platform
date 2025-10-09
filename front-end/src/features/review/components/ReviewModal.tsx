// src/features/review/components/ReviewModal.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

// --- IMPORT ĐÃ REFACTOR ---
import { FormDialog } from "@/components/common/FormDialog";
import { ReviewFormValues, reviewFormSchema } from "@/features/review/schemas";
import ReviewFormFields from "@/features/review/components/ReviewFormFields";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReviewFormValues) => void;
  itemName: string;
  isSubmitting?: boolean;
}

export const ReviewModal = ({
  isOpen,
  onClose,
  onSubmit,
  itemName,
  isSubmitting = false,
}: ReviewModalProps) => {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  // Reset form mỗi khi modal được mở
  useEffect(() => {
    if (isOpen) {
      form.reset({ rating: 5, comment: "" });
    }
  }, [isOpen, form]);

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Đánh giá: ${itemName}`}
      description="Cảm ơn bạn đã sử dụng dịch vụ. Vui lòng chia sẻ trải nghiệm của bạn."
      form={form}
      onFormSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitText="Gửi đánh giá"
    >
      <ReviewFormFields />
    </FormDialog>
  );
};
