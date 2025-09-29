// src/features/product/hooks/useProducts.ts
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/features/product/api/product.api";
import { Product } from "@/features/product/types";

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: getProducts,
  });
};
