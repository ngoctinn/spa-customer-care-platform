// src/features/staff/hooks/useStaffManagement.ts
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStaff } from "./useStaff";
import { FullStaffProfile } from "../types";
import { StaffFormValues, staffFormSchema } from "../schemas";
import { useCrudMutations } from "@/features/management-pages/hooks/useCrudMutations";
import { addStaff, updateStaff, offboardStaff } from "../api/staff.api";

export function useStaffManagement() {
  const { data: staffList = [], isLoading } = useStaff();

  // Sử dụng hook CRUD chung với các API function mới
  const {
    // addMutation, // Chúng ta sẽ xử lý add riêng vì nó khác biệt
    updateMutation,
    deleteMutation, // deleteMutation giờ sẽ gọi offboardStaff
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
    FullStaffProfile,
    any, // Add không dùng ở đây
    Partial<StaffFormValues>
  >(
    ["staffList"],
    async () => {}, // Hàm giả cho add
    (vars: { id: string; data: Partial<StaffFormValues> }) =>
      updateStaff({ staffId: vars.id, staffData: vars.data }),
    offboardStaff, // Sử dụng offboardStaff cho việc xóa
    {
      updateSuccess: "Cập nhật thông tin nhân viên thành công!",
      deleteSuccess: "Đã cho nhân viên nghỉ việc!",
    }
  );

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
  });

  const handleOpenEditFormWithReset = useCallback(
    (staff: FullStaffProfile) => {
      handleOpenEditForm(staff);
      form.reset({
        phone_number: staff.phone_number || "",
        position: staff.position || "",
        hire_date: staff.hire_date ? new Date(staff.hire_date) : undefined,
        employment_status: staff.employment_status,
        notes: staff.notes || "",
      });
    },
    [form, handleOpenEditForm]
  );

  const handleFormSubmit = (data: StaffFormValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    }
    // Logic 'add' sẽ được xử lý trong Wizard riêng
  };

  return {
    isLoading,
    data: staffList,
    form,
    isFormOpen,
    editingItem,
    itemToDelete,
    isSubmitting: updateMutation.isPending,
    handleOpenAddForm, // Giữ lại để có thể trigger wizard
    handleOpenEditForm: handleOpenEditFormWithReset,
    handleCloseForm,
    handleFormSubmit,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  };
}
