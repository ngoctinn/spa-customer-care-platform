// src/features/service/hooks/useServiceManagement.ts
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useServices, useServiceMutations } from "./useServices";
import { Service } from "../types";
import { ServiceFormValues, serviceFormSchema } from "../schemas";

export function useServiceManagement() {
  const { data: services = [], isLoading } = useServices();

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
  } = useServiceMutations();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category_ids: [],
      price: 0,
      duration_minutes: 30,
      images: [],
    },
  });

  const handleOpenAddFormWithReset = useCallback(() => {
    handleOpenAddForm();
    form.reset();
  }, [form, handleOpenAddForm]);

  const handleOpenEditFormWithReset = useCallback(
    (service: Service) => {
      handleOpenEditForm(service);
      form.reset({
        ...service,
        category_ids: service.categories.map((c) => c.id),
        description: service.description || "",
        preparation_notes: service.preparation_notes || "",
        aftercare_instructions: service.aftercare_instructions || "",
        contraindications: service.contraindications || "",
      });
    },
    [form, handleOpenEditForm]
  );

  const handleFormSubmit = (data: ServiceFormValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  return {
    isLoading,
    data: services,
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
