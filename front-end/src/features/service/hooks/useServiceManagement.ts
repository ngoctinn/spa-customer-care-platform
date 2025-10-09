// src/features/service/hooks/useServiceManagement.ts
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useServices, useServiceMutations } from "./useServices";
import { Service } from "../types";
import { ServiceFormValues, serviceFormSchema } from "../schemas";

export function useServiceManagement() {
  const { data: services = [], isLoading } = useServices();

  // ✅ Step 1: Lấy tất cả state và handlers từ useServiceMutations
  const {
    addMutation,
    updateMutation,
    deleteMutation,
    isFormOpen,
    editingItem: editingService,
    itemToDelete: serviceToDelete,
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
      categories: [],
      price: 0,
      duration_minutes: 30,
    },
  });

  // ✅ Step 2: Tạo các hàm "wrapper" để reset form
  const handleOpenAddFormWithReset = useCallback(() => {
    handleOpenAddForm();
    form.reset();
  }, [form, handleOpenAddForm]);

  const handleOpenEditFormWithReset = useCallback(
    (service: Service) => {
      handleOpenEditForm(service);
      form.reset({
        ...service,
        categories: service.categories.map((c) => c.id),
        description: service.description || "",
        preparation_notes: service.preparation_notes || "",
        aftercare_instructions: service.aftercare_instructions || "",
        contraindications: service.contraindications || "",
      });
    },
    [form, handleOpenEditForm]
  );

  const handleFormSubmit = (data: ServiceFormValues) => {
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  // ✅ Step 3: Trả về các giá trị đã được quản lý tập trung
  return {
    isLoading,
    services,
    form,
    isFormOpen,
    editingService,
    serviceToDelete,
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
