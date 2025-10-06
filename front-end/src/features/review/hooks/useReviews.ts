// src/features/review/hooks/useReviews.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReviews, addReview } from "@/features/review/api/review.api";
import { Review } from "@/features/review/types";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/get-error-message";
import { ReviewFormValues } from "../schemas";

export const reviewsQueryKeys = {
  all: ["reviews"] as const,
};

export const useReviews = () => {
  return useQuery<Review[]>({
    queryKey: reviewsQueryKeys.all,
    queryFn: () => getReviews(),
  });
};

export const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation<Review, unknown, ReviewFormValues>({
    mutationFn: addReview,
    onSuccess: async () => {
      toast.success("Gửi đánh giá thành công!");
      // Tự động cập nhật lại danh sách đánh giá
      await queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.all });
    },
    onError: (error) => {
      toast.error("Gửi đánh giá thất bại", {
        description: getErrorMessage(error),
      });
    },
  });
};
