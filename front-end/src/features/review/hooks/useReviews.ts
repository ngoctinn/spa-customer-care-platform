import { useQuery } from "@tanstack/react-query";
//import { getReviews } from "@/features/review/api/review.api";
import { Review } from "@/features/review/types";

export const useReviews = () => {
  return useQuery<Review[]>({
    queryKey: ["reviews"],
    //  queryFn: getReviews,
  });
};
