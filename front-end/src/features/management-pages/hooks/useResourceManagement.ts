// src/features/management-pages/hooks/useResourceManagement.ts
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCallback } from "react";
import { useCrudMutations } from "./useCrudMutations";
import { QueryKey } from "@tanstack/react-query";

// SỬA LỖI: Thêm các thuộc tính ...Error vào đây
interface CustomMessages {
  addSuccess?: string;
  addError?: string;
  updateSuccess?: string;
  updateError?: string;
  deleteSuccess?: string;
  deleteError?: string;
}

// Define the type for the configuration object the hook will receive
interface ResourceManagementOptions<
  T extends { id: string },
  TFormValues extends FieldValues
> {
  queryKey: QueryKey;
  useDataHook: () => { data?: T[]; isLoading: boolean };
  addFn: (data: TFormValues) => Promise<T>;
  updateFn: (params: { id: string; data: Partial<TFormValues> }) => Promise<T>;
  deleteFn: (id: string) => Promise<void>;
  formSchema: z.ZodType<TFormValues, any, any>;
  defaultFormValues: TFormValues;
  getEditFormValues: (item: T) => TFormValues;
  // Kiểu dữ liệu này bây giờ sẽ sử dụng CustomMessages đã được cập nhật ở trên
  customMessages?: CustomMessages;
}

/**
 * Generic hook to manage all CRUD logic, form, and dialog for a resource.
 * @param options - Configuration object for the resource.
 */
export function useResourceManagement<
  T extends { id: string },
  TFormValues extends FieldValues
>({
  queryKey,
  useDataHook,
  addFn,
  updateFn,
  deleteFn,
  formSchema,
  defaultFormValues,
  getEditFormValues,
  customMessages,
}: ResourceManagementOptions<T, TFormValues>) {
  // 1. Fetch data
  const { data = [], isLoading } = useDataHook();

  // 2. Manage mutations and dialog/modal state
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
  } = useCrudMutations<T, TFormValues, Partial<TFormValues>>(
    queryKey,
    addFn,
    updateFn,
    deleteFn,
    customMessages
  );

  // 3. Initialize form
  const form = useForm<TFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues as any,
  });

  // 4. Add logic to reset form when opening dialog
  const handleOpenAddFormWithReset = useCallback(() => {
    handleOpenAddForm();
    form.reset(defaultFormValues);
  }, [form, handleOpenAddForm, defaultFormValues]);

  const handleOpenEditFormWithReset = useCallback(
    (item: T) => {
      handleOpenEditForm(item);
      form.reset(getEditFormValues(item));
    },
    [form, handleOpenEditForm, getEditFormValues]
  );

  // 5. Handle form submission
  const handleFormSubmit = (data: TFormValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  // 6. Return object compatible with ResourcePageLayout
  return {
    data,
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
