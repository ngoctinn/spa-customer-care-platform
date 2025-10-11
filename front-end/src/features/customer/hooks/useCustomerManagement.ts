// src/features/customer/hooks/useCustomerManagement.ts
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCustomers, useCustomerMutations } from "./useCustomers";
import { FullCustomerProfile } from "../types";
import { z } from "zod";

// Tạo schema tạm thời cho form chỉnh sửa khách hàng
const customerFormSchema = z.object({
  full_name: z.string().min(3, "Tên phải có ít nhất 3 ký tự."),
  phone: z.string().optional(),
  notes: z.string().optional(),
});
type CustomerFormValues = z.infer<typeof customerFormSchema>;

export function useCustomerManagement() {
  const { data: customers = [], isLoading } = useCustomers();

  // Giả sử có customer mutations, dù thực tế có thể không cần add/delete
  const {
    updateMutation,
    deleteMutation, // Giả sử là deactivate
    isFormOpen,
    editingItem,
    itemToDelete,
    handleOpenEditForm,
    handleCloseForm,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useCustomerMutations();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
  });

  const handleOpenEditFormWithReset = useCallback(
    (customer: FullCustomerProfile) => {
      handleOpenEditForm(customer);
      form.reset({
        full_name: customer.full_name,
        phone: customer.phone || "",
        notes: customer.customer_profile.notes || "",
      });
    },
    [form, handleOpenEditForm]
  );

  const handleFormSubmit = (data: CustomerFormValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    }
  };

  // Vì không có form thêm mới, ta sẽ trả về một hàm trống
  const handleOpenAddForm = () => {
    console.warn("Adding customers from the dashboard is not supported.");
  };

  return {
    data: customers,
    isLoading,
    form,
    isFormOpen,
    editingItem,
    itemToDelete,
    isSubmitting: updateMutation.isPending,
    handleOpenAddForm, // Hàm trống
    handleOpenEditForm: handleOpenEditFormWithReset,
    handleCloseForm,
    handleFormSubmit,
    handleOpenDeleteDialog,
    handleConfirmDelete,
    handleCloseDeleteDialog,
  };
}
