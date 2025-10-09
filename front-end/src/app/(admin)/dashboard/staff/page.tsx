// src/app/(admin)/dashboard/staff/page.tsx (Refactored)

"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/data-table/data-table";
import { Button } from "@/components/ui/button";
import { FullPageLoader } from "@/components/ui/spinner";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { FormDialog } from "@/components/common/FormDialog";
import { getStaffColumns } from "@/features/staff/components/columns";
import StaffForm from "@/features/staff/components/StaffForm";
import { useStaffManagement } from "@/features/staff/hooks/useStaffManagement"; // <- Import the new hook
import { PlusCircle } from "lucide-react";
import { useRoles } from "@/features/user/hooks/useRoles";

export default function StaffPage() {
  // Just one line to get all the logic!
  const {
    isLoading,
    staffList,
    form,
    isFormOpen,
    editingStaff,
    staffToDelete,
    isSubmitting,
    handleOpenAddForm,
    handleOpenEditForm,
    handleCloseForm,
    handleFormSubmit,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useStaffManagement();

  const { data: roles = [] } = useRoles();

  const columns = useMemo(
    () => getStaffColumns(handleOpenEditForm, handleOpenDeleteDialog),
    [handleOpenEditForm, handleOpenDeleteDialog]
  );

  const roleFilterOptions = useMemo(
    () => roles.map((role) => ({ label: role.name, value: role.name })),
    [roles]
  );

  const statusFilterOptions = [
    { label: "Hoạt động", value: "active" },
    { label: "Tạm ngưng", value: "inactive" },
  ];

  if (isLoading) {
    return <FullPageLoader text="Đang tải danh sách nhân viên..." />;
  }

  return (
    <>
      <PageHeader
        title="Quản lý nhân viên"
        description="Thêm mới, chỉnh sửa và quản lý thông tin các nhân viên trong hệ thống."
        actionNode={
          <Button onClick={handleOpenAddForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm nhân viên
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={staffList}
        toolbarProps={{
          searchColumnId: "full_name",
          searchPlaceholder: "Lọc theo tên nhân viên...",
          facetedFilters: [
            {
              columnId: "roles",
              title: "Vai trò",
              options: roleFilterOptions,
            },
            {
              columnId: "is_active",
              title: "Trạng thái",
              options: statusFilterOptions,
            },
          ],
          // This assumes your DataTable can handle bulk deletes.
          // If not, you can add this logic to the hook as well.
          onDeleteSelected: (selectedRows) => {
            console.log("Bulk delete requested for:", selectedRows);
          },
        }}
      />

      <FormDialog
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingStaff ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
        description="Điền đầy đủ các thông tin cần thiết dưới đây."
        form={form}
        onFormSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        submitText={editingStaff ? "Lưu thay đổi" : "Tạo mới"}
      >
        <StaffForm />
      </FormDialog>

      <ConfirmationModal
        isOpen={!!staffToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={`Xác nhận xóa "${staffToDelete?.full_name}"`}
        description="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa nhân viên này không?"
        isDestructive
        confirmText="Vẫn xóa"
      />
    </>
  );
}
