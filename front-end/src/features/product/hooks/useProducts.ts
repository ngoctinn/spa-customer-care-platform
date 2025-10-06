// src/features/product/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/features/product/api/product.api";
import type { GetProductsParams } from "@/features/product/api/product.api";
import type { ProductFormValues } from "@/features/product/schemas";
import type { Product } from "@/features/product/types";
import { getErrorMessage } from "@/lib/get-error-message";

export const productsQueryKeys = {
  all: ["products"] as const,
  list: (params?: GetProductsParams) => ["products", { params }] as const,
  detail: (productId: string) => ["products", productId] as const,
};

// Hook để lấy danh sách sản phẩm
export const useProducts = (params?: GetProductsParams) => {
  return useQuery<Product[]>({
    queryKey: productsQueryKeys.list(params),
    queryFn: () => getProducts(params),
    retry: 1,
    staleTime: 60 * 1000,
  });
};

// Hook để thêm sản phẩm mới
export const useAddProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<Product, unknown, ProductFormValues>({
    mutationFn: addProduct,
    onSuccess: async (createdProduct) => {
      toast.success("Thêm sản phẩm thành công!");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productsQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: productsQueryKeys.detail(createdProduct.id),
        }),
      ]);
    },
    onError: (error) => {
      toast.error("Thêm sản phẩm thất bại", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Hook để cập nhật sản phẩm
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Product,
    unknown,
    Parameters<typeof updateProduct>[0]
  >({
    mutationFn: updateProduct,
    onSuccess: async (_, variables) => {
      toast.success("Cập nhật thông tin thành công!");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productsQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: productsQueryKeys.detail(variables.productId),
        }),
      ]);
    },
    onError: (error) => {
      toast.error("Cập nhật thất bại", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Hook để xóa sản phẩm
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: deleteProduct,
    onSuccess: async (_, productId) => {
      toast.success("Đã xóa sản phẩm!");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productsQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: productsQueryKeys.detail(productId),
        }),
      ]);
    },
    onError: (error) => {
      toast.error("Xóa thất bại", {
        description: getErrorMessage(error),
      });
    },
  });
};
