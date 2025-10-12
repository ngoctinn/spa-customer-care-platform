// src/features/inventory/hooks/useSupplierManagement.ts
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCrudMutations } from "@/hooks/useCrudMutations";
import { Supplier } from "../types";
import {
  SupplierFormValues,
  supplierFormSchema,
} from "@/features/inventory/schemas/supplier.schema";
import { useSuppliers } from "@/features/inventory/hooks/useSuppliers";
import {
  addSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/features/inventory/apis/supplier.api";

export function useSupplierManagement() {
  const { data: suppliers = [], isLoading } = useSuppliers();

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
    Supplier,
    SupplierFormValues,
    Partial<SupplierFormValues>
  >(["suppliers"], addSupplier, updateSupplier, deleteSupplier, {
    addSuccess: "Thêm nhà cung cấp thành công!",
    updateSuccess: "Cập nhật nhà cung cấp thành công!",
    deleteSuccess: "Đã xóa nhà cung cấp!",
  });

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  const handleOpenAddFormWithReset = useCallback(() => {
    handleOpenAddForm();
    form.reset();
  }, [form, handleOpenAddForm]);

  const handleOpenEditFormWithReset = useCallback(
    (supplier: Supplier) => {
      handleOpenEditForm(supplier);
      form.reset(supplier);
    },
    [form, handleOpenEditForm]
  );

  const handleFormSubmit = (data: SupplierFormValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  return {
    isLoading,
    data: suppliers,
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
