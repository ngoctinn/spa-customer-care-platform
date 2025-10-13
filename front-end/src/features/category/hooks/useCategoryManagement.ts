// src/features/category/hooks/useCategoryManagement.ts
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCrudMutations } from "@/features/management-pages/hooks/useCrudMutations";
import { Category } from "../types";
import {
  CategoryFormValues,
  categoryFormSchema,
} from "@/features/category/schemas";
import { useCategories } from "./useCategories";
import {
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/features/category/api/category.api";

export function useCategoryManagement() {
  const { data: categories = [], isLoading } = useCategories();

  const {
    addMutation,
    updateMutation,
    deleteMutation,
    isFormOpen,
    editingItem,
    itemToDelete,
    handleOpenAddForm,
    handleOpenEditForm,
    handleCloseForm,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useCrudMutations<Category, CategoryFormValues, CategoryFormValues>(
    ["categories"],
    addCategory,
    updateCategory,
    deleteCategory,
    {
      addSuccess: "Thêm danh mục thành công!",
      updateSuccess: "Cập nhật danh mục thành công!",
      deleteSuccess: "Đã xóa danh mục!",
    }
  );

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      category_type: "service",
    },
  });

  const handleOpenAddFormWithReset = useCallback(() => {
    handleOpenAddForm();
    form.reset({ name: "", category_type: "service" });
  }, [form, handleOpenAddForm]);

  const handleOpenEditFormWithReset = useCallback(
    (category: Category) => {
      handleOpenEditForm(category);
      form.reset(category);
    },
    [form, handleOpenEditForm]
  );

  const handleFormSubmit = (data: CategoryFormValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  return {
    isLoading,
    data: categories,
    form,
    isFormOpen,
    editingItem,
    itemToDelete,
    isSubmitting: addMutation.isPending || updateMutation.isPending,
    handleOpenAddForm: handleOpenAddFormWithReset,
    handleOpenEditForm: handleOpenEditFormWithReset,
    handleCloseForm,
    handleFormSubmit,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  };
}
