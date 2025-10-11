// src/app/(admin)/dashboard/inventory/suppliers/page.tsx
"use client";

import { useMemo } from "react";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/data-table/data-table";
import { Button } from "@/components/ui/button";
import { FullPageLoader } from "@/components/ui/spinner";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { FormDialog } from "@/components/common/FormDialog";
import { useSupplierManagement } from "@/features/inventory/hooks/useSupplierManagement";
import { getSupplierColumns } from "@/features/inventory/components/suppliers/columns";
import SupplierForm from "@/features/inventory/components/suppliers/SupplierForm";

export default function SuppliersPage() {
  const {
    isLoading,
    suppliers,
    form,
    isFormOpen,
    editingSupplier,
    supplierToDelete,
    isSubmitting,
    handleOpenAddForm,
    handleOpenEditForm,
    handleCloseForm,
    handleFormSubmit,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useSupplierManagement();

  const columns = useMemo(
    () => getSupplierColumns(handleOpenEditForm, handleOpenDeleteDialog),
    [handleOpenEditForm, handleOpenDeleteDialog]
  );

  if (isLoading) {
    return <FullPageLoader text="Đang tải danh sách nhà cung cấp..." />;
  }

  return (
    <>
      <PageHeader
        title="Quản lý Nhà Cung Cấp"
        actionNode={
          <Button onClick={handleOpenAddForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm Nhà Cung Cấp
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={suppliers}
        toolbarProps={{
          searchColumnId: "name",
          searchPlaceholder: "Lọc theo tên nhà cung cấp...",
        }}
      />
      <FormDialog
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={
          editingSupplier ? "Chỉnh sửa Nhà Cung Cấp" : "Thêm Nhà Cung Cấp Mới"
        }
        form={form}
        onFormSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      >
        <SupplierForm />
      </FormDialog>
      <ConfirmationModal
        isOpen={!!supplierToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={`Xác nhận xóa "${supplierToDelete?.name}"`}
        description="Hành động này không thể hoàn tác."
        isDestructive
      />
    </>
  );
}
