// src/features/treatment/hooks/useTreatmentPlanManagement.ts
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useTreatmentPlans,
  useTreatmentPlanMutations,
} from "./useTreatmentPlans";
import { TreatmentPlan } from "../types";
import { TreatmentPlanFormValues, treatmentPlanFormSchema } from "../schemas";

export function useTreatmentPlanManagement() {
  const { data: plans = [], isLoading } = useTreatmentPlans();

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
  } = useTreatmentPlanMutations();

  const form = useForm<TreatmentPlanFormValues>({
    resolver: zodResolver(treatmentPlanFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category_ids: [],
      price: 0,
      steps: [{ serviceId: "" }],
      images: [],
    },
  });

  const handleOpenAddFormWithReset = useCallback(() => {
    handleOpenAddForm();
    form.reset();
  }, [form, handleOpenAddForm]);

  const handleOpenEditFormWithReset = useCallback(
    (plan: TreatmentPlan) => {
      handleOpenEditForm(plan);
      form.reset({
        ...plan,
        category_ids: plan.categories ? plan.categories.map((c) => c.id) : [],
        steps: plan.steps.map((s) => ({
          serviceId: s.service_id,
          description: s.description || "",
        })),
      });
    },
    [form, handleOpenEditForm]
  );

  const handleFormSubmit = (data: TreatmentPlanFormValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  return {
    data: plans,
    isLoading,
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
