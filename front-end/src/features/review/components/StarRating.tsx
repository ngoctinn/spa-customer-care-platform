"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  totalStars?: number;
}

const StarRating = ({
  rating,
  onRatingChange,
  totalStars = 5,
}: StarRatingProps) => {
  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={starValue}
            onClick={() => onRatingChange(starValue)}
            className="focus:outline-none"
          >
            <Star
              className={cn(
                "w-6 h-6",
                starValue <= rating ? "text-warning fill-star" : "text-border"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
