// src/app/(admin)/dashboard/roles/page.tsx (Refactored)
"use client";

import { useMemo } from "react";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/data-table/data-table";
import { Button } from "@/components/ui/button";
import { FullPageLoader } from "@/components/ui/spinner";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { FormDialog } from "@/components/common/FormDialog";
import { getRoleColumns } from "@/features/user/components/columns";
import RoleForm from "@/features/user/components/RoleForm";
import { useRoleManagement } from "@/features/user/hooks/useRoleManagement"; // <- Import hook

export default function RolesPage() {
  const {
    isLoading,
    roles,
    form,
    isFormOpen,
    editingRole,
    roleToDelete,
    isSubmitting,
    handleOpenAddForm,
    handleOpenEditForm,
    handleGoToDetail,
    handleCloseForm,
    handleFormSubmit,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useRoleManagement();

  const columns = useMemo(
    () =>
      getRoleColumns(
        handleOpenEditForm,
        handleGoToDetail,
        handleOpenDeleteDialog
      ),
    [handleOpenEditForm, handleGoToDetail, handleOpenDeleteDialog]
  );

  if (isLoading) {
    return <FullPageLoader text="Đang tải danh sách vai trò..." />;
  }

  return (
    <>
      <PageHeader
        title="Vai trò & Phân quyền"
        description="Quản lý các vai trò và gán quyền hạn truy cập cho từng vai trò trong hệ thống."
        actionNode={
          <Button onClick={handleOpenAddForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm vai trò
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={roles}
        toolbarProps={{
          searchColumnId: "name",
          searchPlaceholder: "Tìm theo tên vai trò...",
        }}
      />
      <FormDialog
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingRole ? "Chỉnh sửa vai trò" : "Tạo vai trò mới"}
        form={form}
        onFormSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      >
        <RoleForm />
      </FormDialog>
      <ConfirmationModal
        isOpen={!!roleToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={`Xác nhận xóa vai trò "${roleToDelete?.name}"`}
        description="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa vai trò này không?"
        isDestructive
        confirmText="Xóa"
      />
    </>
  );
}
