// src/features/promotion/hooks/usePromotions.ts
import { useQuery } from "@tanstack/react-query";
import { getPromotions } from "@/features/promotion/api/promotion.api";
import { Promotion } from "@/features/promotion/types";

export const usePromotions = () => {
  return useQuery<Promotion[]>({
    queryKey: ["promotions"],
    queryFn: () => getPromotions(),
    retry: 1,
    staleTime: 60 * 1000,
  });
};
