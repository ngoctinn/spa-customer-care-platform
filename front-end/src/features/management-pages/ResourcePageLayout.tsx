"use client";

import React from "react";
import { FieldValues } from "react-hook-form";
import { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";

// --- Import các component từ UI Kit ---
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/data-table/data-table";
import { Button } from "@/components/ui/button";
import { FullPageLoader } from "@/components/ui/spinner";
import { FormDialog } from "@/components/common/FormDialog";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Import các kiểu đã định nghĩa ---
import { ResourcePageLayoutProps } from "@/features/management-pages/types";

// Component Actions cho mỗi dòng, được layout tự quản lý
const RowActions = <T extends { id: string }>({
  item,
  onEdit,
  onDelete,
}: {
  item: T;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <span className="sr-only">Mở menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => onEdit(item)}>
        <Edit className="mr-2 h-4 w-4" />
        Sửa
      </DropdownMenuItem>
      <DropdownMenuItem
        className="text-destructive"
        onClick={() => onDelete(item)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Xóa
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// --- Component Layout Chính ---
export function ResourcePageLayout<
  T extends { id: string; name?: string },
  TFormValues extends FieldValues
>({
  title,
  description,
  entityName,
  columns: propColumns,
  useManagementHook,
  FormComponent,
  toolbarProps,
}: ResourcePageLayoutProps<T, TFormValues>) {
  // Gọi hook quản lý được truyền vào để lấy tất cả state và logic
  const {
    data,
    isLoading,
    form,
    isFormOpen,
    editingItem,
    itemToDelete,
    isSubmitting,
    handleOpenAddForm,
    handleOpenEditForm,
    handleCloseForm,
    handleFormSubmit,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useManagementHook();

  // Tự động thêm cột "Actions" vào cuối bảng
  const columnsWithActions = React.useMemo<ColumnDef<T>[]>(
    () => [
      ...propColumns,
      {
        id: "actions",
        cell: ({ row }) => (
          <RowActions
            item={row.original}
            onEdit={handleOpenEditForm}
            onDelete={handleOpenDeleteDialog}
          />
        ),
      },
    ],
    [propColumns, handleOpenEditForm, handleOpenDeleteDialog]
  );

  if (isLoading) {
    return <FullPageLoader text={`Đang tải danh sách ${entityName}...`} />;
  }

  return (
    <>
      {/* --- Tiêu đề trang & Nút Thêm Mới --- */}
      <PageHeader
        title={title}
        description={description}
        actionNode={
          <Button onClick={handleOpenAddForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm {entityName}
          </Button>
        }
      />

      {/* --- Bảng Dữ Liệu --- */}
      <DataTable
        columns={columnsWithActions}
        data={data}
        toolbarProps={{
          ...toolbarProps,
          searchColumnId: toolbarProps?.searchColumnId || "name",
          searchPlaceholder:
            toolbarProps?.searchPlaceholder || `Lọc theo tên ${entityName}...`,
        }}
      />

      {/* --- Dialog Form Thêm/Sửa --- */}
      <FormDialog
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={
          editingItem ? `Chỉnh sửa ${entityName}` : `Tạo ${entityName} mới`
        }
        form={form}
        onFormSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        submitText={editingItem ? "Lưu thay đổi" : "Tạo mới"}
      >
        <FormComponent />
      </FormDialog>

      {/* --- Dialog Xác Nhận Xóa --- */}
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={`Xác nhận xóa ${entityName}`}
        description={
          <span>
            Bạn có chắc chắn muốn xóa {entityName}{" "}
            <strong>&quot;{itemToDelete?.name}&quot;</strong> không? Hành động
            này không thể hoàn tác.
          </span>
        }
        isDestructive
        confirmText="Xóa"
      />
    </>
  );
}
