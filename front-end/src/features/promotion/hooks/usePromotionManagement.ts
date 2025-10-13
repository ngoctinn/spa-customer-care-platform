// src/features/promotion/hooks/usePromotionManagement.ts
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCrudMutations } from "@/features/management-pages/hooks/useCrudMutations";
import { usePromotions } from "./usePromotions";
import { Promotion } from "../types";
import { PromotionFormValues, promotionFormSchema } from "../schemas";
import {
  addPromotion,
  updatePromotion,
  deletePromotion,
} from "../api/promotion.api";

export function usePromotionManagement() {
  const { data: promotions = [], isLoading } = usePromotions();

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
  } = useCrudMutations<
    Promotion,
    PromotionFormValues,
    Partial<PromotionFormValues>
  >(["promotions"], addPromotion, updatePromotion, deletePromotion, {
    addSuccess: "Thêm khuyến mãi thành công!",
    updateSuccess: "Cập nhật khuyến mãi thành công!",
    deleteSuccess: "Đã xóa khuyến mãi!",
  });

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      discount_percent: 0,
      start_date: new Date(),
      end_date: new Date(),
    },
  });

  const handleOpenAddFormWithReset = useCallback(() => {
    handleOpenAddForm();
    form.reset({
      title: "",
      description: "",
      discount_percent: 10,
      start_date: new Date(),
      end_date: new Date(new Date().setDate(new Date().getDate() + 7)),
    });
  }, [form, handleOpenAddForm]);

  const handleOpenEditFormWithReset = useCallback(
    (promotion: Promotion) => {
      handleOpenEditForm(promotion);
      form.reset({
        ...promotion,
        start_date: new Date(promotion.start_date),
        end_date: new Date(promotion.end_date),
      });
    },
    [form, handleOpenEditForm]
  );

  const handleFormSubmit = (data: PromotionFormValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  return {
    isLoading,
    data: promotions,
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
