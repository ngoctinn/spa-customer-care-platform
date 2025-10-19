import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCustomers, useCustomerMutations } from "./useCustomers";
import { FullCustomerProfile } from "../types";
import { CustomerFormValues, customerFormSchema } from "../schemas"; // <-- Đã cập nhật import

export function useCustomerManagement() {
  const { data: customers = [], isLoading } = useCustomers();

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
  } = useCustomerMutations();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
  });

  const handleOpenAddFormWithReset = useCallback(() => {
    handleOpenAddForm();
    form.reset({
      full_name: "",
      phone_number: "",
      note: "",
      credit_limit: 0,
    });
  }, [form, handleOpenAddForm]);

  const handleOpenEditFormWithReset = useCallback(
    (customer: FullCustomerProfile) => {
      handleOpenEditForm(customer);
      form.reset({
        full_name: customer.full_name,
        phone_number: customer.phone_number || "",
        note: customer.note || "",
        credit_limit: customer.credit_limit || 0,
      });
    },
    [form, handleOpenEditForm]
  );

  const handleFormSubmit = (data: CustomerFormValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: data });
    } else {
      addMutation.mutate(data);
    }
  };

  return {
    data: customers,
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
    handleConfirmDelete,
    handleCloseDeleteDialog,
  };
}
