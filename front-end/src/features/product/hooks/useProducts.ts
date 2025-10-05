// src/features/product/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/features/product/api/product.api";
import { Product } from "@/features/product/types";
import { ProductFormValues } from "@/features/product/schemas";
import { toast } from "sonner";

const queryKey = ["products"];

// Hook để lấy danh sách sản phẩm
export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: queryKey,
    queryFn: getProducts,
  });
};

// Hook để thêm sản phẩm mới
export const useAddProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productData: ProductFormValues) => addProduct(productData),
    onSuccess: () => {
      toast.success("Thêm sản phẩm thành công!");
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error) => {
      toast.error("Thêm sản phẩm thất bại", { description: error.message });
    },
  });
};

// Hook để cập nhật sản phẩm
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      productId: string;
      productData: Partial<ProductFormValues>;
    }) => updateProduct(data),
    onSuccess: () => {
      toast.success("Cập nhật thông tin thành công!");
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error) => {
      toast.error("Cập nhật thất bại", { description: error.message });
    },
  });
};

// Hook để xóa sản phẩm
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      toast.success("Đã xóa sản phẩm!");
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error) => {
      toast.error("Xóa thất bại", { description: error.message });
    },
  });
};
