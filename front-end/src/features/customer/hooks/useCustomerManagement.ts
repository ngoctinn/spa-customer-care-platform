import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCustomers, useCustomerMutations } from "./useCustomers";
import { FullCustomerProfile } from "../types";
import { z } from "zod";
import { nameSchema, phoneSchema } from "@/lib/schemas";

const customerFormSchema = z.object({
  full_name: nameSchema,
  phone_number: phoneSchema.optional().or(z.literal("")),
  note: z.string().optional(),
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
      phone_number: "",
      note: "",
    });
  }, [form, handleOpenAddForm]);

  const handleOpenEditFormWithReset = useCallback(
    (customer: FullCustomerProfile) => {
      handleOpenEditForm(customer);
      form.reset({
        full_name: customer.full_name,
        phone_number: customer.phone_number || "",
        note: customer.note || "",
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
