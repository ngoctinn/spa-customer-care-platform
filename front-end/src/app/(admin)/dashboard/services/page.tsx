// src/app/(admin)/dashboard/services/page.tsx (Refactored)
"use client";

import { useMemo } from "react";
import { PlusCircle } from "lucide-react";
import { useServiceManagement } from "@/features/service/hooks/useServiceManagement"; // <- Import hook
import { getServiceColumns } from "@/features/service/components/columns";
import { DataTable } from "@/components/common/data-table/data-table";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/common/FormDialog";
import ServiceFormFields from "@/features/service/components/ServiceForm";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { FullPageLoader } from "@/components/ui/spinner";
import { useCategories } from "@/features/category/hooks/useCategories";

export default function ServicesDashboardPage() {
  const {
    isLoading,
    services,
    form,
    isFormOpen,
    editingService,
    serviceToDelete,
    isSubmitting,
    handleOpenAddForm,
    handleOpenEditForm,
    handleCloseForm,
    handleFormSubmit,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useServiceManagement();

  const { data: categories = [] } = useCategories("service");

  const columns = useMemo(
    () => getServiceColumns(handleOpenEditForm, handleOpenDeleteDialog),
    [handleOpenEditForm, handleOpenDeleteDialog]
  );

  const categoryFilterOptions = useMemo(
    () => categories.map((cat) => ({ label: cat.name, value: cat.name })),
    [categories]
  );

  if (isLoading) {
    return <FullPageLoader text="Đang tải danh sách dịch vụ..." />;
  }

  return (
    <>
      <PageHeader
        title="Quản lý Dịch vụ"
        description="Thêm mới, chỉnh sửa và quản lý tất cả dịch vụ của spa."
        actionNode={
          <Button onClick={handleOpenAddForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm dịch vụ
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={services}
        toolbarProps={{
          searchColumnId: "name",
          searchPlaceholder: "Lọc theo tên dịch vụ...",
          facetedFilters: [
            {
              columnId: "categories",
              title: "Danh mục",
              options: categoryFilterOptions,
            },
          ],
        }}
      />
      <FormDialog
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
        description="Điền đầy đủ các thông tin cần thiết dưới đây."
        form={form}
        onFormSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        submitText={editingService ? "Lưu thay đổi" : "Tạo mới"}
      >
        <ServiceFormFields />
      </FormDialog>

      <ConfirmationModal
        isOpen={!!serviceToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa dịch vụ"
        description={`Bạn có chắc chắn muốn xóa dịch vụ "${serviceToDelete?.name}" không?`}
        isDestructive
      />
    </>
  );
}
