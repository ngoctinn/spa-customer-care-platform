import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCustomers, useCustomerMutations } from "./useCustomers";
import { FullCustomerProfile } from "../types";
import { z } from "zod";
import {
  emailSchema,
  nameSchema,
  passwordSchema,
  phoneSchema,
} from "@/lib/schemas";

const customerFormSchema = z.object({
  full_name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  password: passwordSchema.optional(),
  notes: z.string().optional(),
});
export type CustomerFormValues = z.infer<typeof customerFormSchema>;

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
      email: "",
      phone: "",
      password: "",
      notes: "",
    });
  }, [form, handleOpenAddForm]);

  const handleOpenEditFormWithReset = useCallback(
    (customer: FullCustomerProfile) => {
      handleOpenEditForm(customer);
      form.reset({
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone || "",
        notes: customer.customer_profile.notes || "",
        password: "", // Không hiển thị password cũ
      });
    },
    [form, handleOpenEditForm]
  );

  const handleFormSubmit = (data: CustomerFormValues) => {
    if (editingItem) {
      const { password, ...updateData } = data;
      updateMutation.mutate({ id: editingItem.id, data: updateData });
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
