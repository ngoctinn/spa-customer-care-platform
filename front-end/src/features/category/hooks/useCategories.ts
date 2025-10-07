import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/features/category/api/category.api";
import { Category } from "@/features/category/types";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/get-error-message";
import { CategoryFormValues } from "../schemas";

export const categoriesQueryKeys = {
  all: ["categories"] as const,
};

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: categoriesQueryKeys.all,
    queryFn: () => getCategories(),
  });
};

// highlight-start
export const useAddCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<Category, unknown, CategoryFormValues>({
    mutationFn: addCategory,
    onSuccess: async () => {
      toast.success("Thêm danh mục thành công!");
      await queryClient.invalidateQueries({
        queryKey: categoriesQueryKeys.all,
      });
    },
    onError: (error) => {
      toast.error("Thêm thất bại", { description: getErrorMessage(error) });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Category,
    unknown,
    { categoryId: string; categoryData: Partial<CategoryFormValues> }
  >({
    mutationFn: updateCategory,
    onSuccess: async () => {
      toast.success("Cập nhật danh mục thành công!");
      await queryClient.invalidateQueries({
        queryKey: categoriesQueryKeys.all,
      });
    },
    onError: (error) => {
      toast.error("Cập nhật thất bại", { description: getErrorMessage(error) });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, string>({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      toast.success("Đã xóa danh mục!");
      await queryClient.invalidateQueries({
        queryKey: categoriesQueryKeys.all,
      });
    },
    onError: (error) => {
      toast.error("Xóa thất bại", {
        description: getErrorMessage(error),
      });
    },
  });
};
// highlight-end
