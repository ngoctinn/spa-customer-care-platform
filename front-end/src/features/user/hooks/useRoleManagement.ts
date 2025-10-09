// src/features/user/hooks/useRoleManagement.ts
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Role } from "../types";
import { RoleFormValues, roleFormSchema } from "../schemas";
import { useRoles, useRoleMutations } from "./useRoles";

export function useRoleManagement() {
  const router = useRouter();
  const { data: roles = [], isLoading } = useRoles();

  // ✅ Step 1: Lấy tất cả state và handlers từ useRoleMutations
  const {
    addMutation,
    updateMutation,
    deleteMutation,
    isFormOpen,
    editingItem: editingRole, // Đổi tên để phù hợp ngữ cảnh
    itemToDelete: roleToDelete, // Đổi tên để phù hợp ngữ cảnh
    handleOpenAddForm,
    handleOpenEditForm,
    handleCloseForm,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useRoleMutations();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: "", description: "" },
  });

  // ✅ Step 2: Tạo các hàm "wrapper" để reset form, vì logic này là duy nhất cho mỗi hook
  const handleOpenAddFormWithReset = useCallback(() => {
    handleOpenAddForm(); // Gọi hàm gốc từ useCrudMutations
    form.reset({ name: "", description: "" });
  }, [form, handleOpenAddForm]);

  const handleOpenEditFormWithReset = useCallback(
    (role: Role) => {
      handleOpenEditForm(role); // Gọi hàm gốc
      form.reset({ name: role.name, description: role.description || "" });
    },
    [form, handleOpenEditForm]
  );

  const handleGoToDetail = (roleId: string) => {
    router.push(`/dashboard/roles/${roleId}`);
  };

  const handleFormSubmit = (data: RoleFormValues) => {
    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  // ✅ Step 3: Trả về các giá trị đã được quản lý tập trung
  return {
    isLoading,
    roles,
    form,
    isFormOpen,
    editingRole,
    roleToDelete,
    isSubmitting: addMutation.isPending || updateMutation.isPending,
    handleOpenAddForm: handleOpenAddFormWithReset,
    handleOpenEditForm: handleOpenEditFormWithReset,
    handleGoToDetail,
    handleCloseForm,
    handleFormSubmit,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  };
}
