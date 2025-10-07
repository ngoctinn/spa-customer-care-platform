// src/features/review/components/ReviewList.tsx
"use client";

import { Review } from "@/features/review/types";
import { FullCustomerProfile } from "@/features/customer/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRating from "@/features/review/components/StarRating";
import { useCustomers } from "@/features/customer/hooks/useCustomers";
import { FullPageLoader } from "@/components/ui/spinner";
import { useMemo } from "react";

interface ReviewListProps {
  reviews: Review[];
}

const ReviewItem = ({
  review,
  customer,
}: {
  review: Review;
  customer?: FullCustomerProfile;
}) => (
  <div className="flex items-start gap-4 py-4">
    <Avatar>
      <AvatarImage
        src={
          customer?.avatar_url ||
          `https://api.dicebear.com/7.x/notionists/svg?seed=${customer?.id}`
        }
      />
      <AvatarFallback>{customer?.full_name?.[0] || "A"}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <p className="font-semibold">
          {customer?.full_name || "Một khách hàng"}
        </p>
        <span className="text-xs text-muted-foreground">
          {new Date(review.created_at).toLocaleDateString("vi-VN")}
        </span>
      </div>
      <div className="flex items-center my-1">
        {/* Chuyển thành chế độ chỉ đọc */}
        <StarRating rating={review.rating} onRatingChange={() => {}} />
      </div>
      <p className="text-sm text-muted-foreground">{review.comment}</p>
    </div>
  </div>
);

// Component này giờ chỉ tập trung vào việc render danh sách
export const ReviewList = ({ reviews }: ReviewListProps) => {
  const { data: customers = [], isLoading } = useCustomers();

  const customersMap = useMemo(() => {
    return new Map(customers.map((customer) => [customer.id, customer]));
  }, [customers]);

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="divide-y">
      {reviews.map((review) => {
        const customer = customersMap.get(review.customer_id);
        return (
          <ReviewItem key={review.id} review={review} customer={customer} />
        );
      })}
    </div>
  );
};
