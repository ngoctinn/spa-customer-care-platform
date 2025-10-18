// src/features/product/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/features/product/api/product.api";
import { Product } from "@/features/product/types";
import { ProductFormValues } from "@/features/product/schemas";
import { useCrudMutations } from "@/features/management-pages/hooks/useCrudMutations";

const queryKey = ["products"];

// Hook để lấy danh sách sản phẩm
export const useProducts = () => {
  const { data, isLoading, isError, error } = useQuery<Product[]>({
    queryKey: queryKey,
    queryFn: () => getProducts(),
    retry: 1,
    staleTime: 60 * 1000,
  });

  return { data, isLoading, isError, error };
};

/**
 * Hook để lấy thông tin chi tiết một sản phẩm bằng ID
 * @param id ID của sản phẩm
 */
export const useProductById = (id: string | null) => {
  const { data, isLoading, isError, error } = useQuery<Product | null>({
    queryKey: ["products", id],
    queryFn: () => (id ? getProductById(id) : null),
    enabled: !!id, // Chỉ fetch khi có id
  });

  return { data, isLoading, isError, error };
};

export const useProductMutations = () => {
  return useCrudMutations<
    Product,
    ProductFormValues,
    Partial<ProductFormValues>
  >(
    queryKey,
    addProduct,
    (vars: { id: string; data: Partial<ProductFormValues> }) =>
      updateProduct({ productId: vars.id, productData: vars.data }),
    deleteProduct,
    {
      addSuccess: "Thêm sản phẩm thành công!",
      updateSuccess: "Cập nhật sản phẩm thành công!",
      deleteSuccess: "Đã xóa sản phẩm!",
    }
  );
};
