// src/features/staff/hooks/useStaffManagement.ts
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStaff, useStaffMutations } from "./useStaff";
import { staffFormSchema, StaffFormValues } from "../schemas";
import { FullStaffProfile } from "../types";

export function useStaffManagement() {
  const { data: staffList = [], isLoading } = useStaff();

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
  } = useStaffMutations();

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: { full_name: "", email: "", phone: "", role_id: "" },
  });

  // Mở rộng hàm gốc để reset form với dữ liệu đúng
  const handleOpenEditFormWithReset = useCallback(
    (staff: FullStaffProfile) => {
      handleOpenEditForm(staff); // Gọi hàm gốc từ useCrudMutations
      form.reset({
        full_name: staff.full_name,
        email: staff.email,
        phone: staff.phone || "",
        role_id: staff.roles[0]?.id || "",
      });
    },
    [form, handleOpenEditForm]
  );

  // Mở rộng hàm gốc để reset form khi thêm mới
  const handleOpenAddFormWithReset = useCallback(() => {
    handleOpenAddForm(); // Gọi hàm gốc
    form.reset();
  }, [form, handleOpenAddForm]);

  const handleFormSubmit = (data: StaffFormValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  return {
    isLoading,
    data: staffList,
    form,
    // Trả về các state và handler đã được quản lý tập trung
    isFormOpen,
    editingItem,
    itemToDelete,
    isSubmitting: addMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleOpenAddForm: handleOpenAddFormWithReset,
    handleOpenEditForm: handleOpenEditFormWithReset,
    handleCloseForm,
    handleFormSubmit,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  };
}
