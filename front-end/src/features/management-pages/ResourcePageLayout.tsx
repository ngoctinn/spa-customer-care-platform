"use client";

import React from "react";
import { FieldValues } from "react-hook-form";
import { ColumnDef, Row } from "@tanstack/react-table";
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";

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
import { ResourcePageLayoutProps } from "@/features/management-pages/types";

const DefaultRowActions = <T extends { id: string }>({
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
  renderRowActions, // REFACTOR: Add renderRowActions prop
}: ResourcePageLayoutProps<T, TFormValues>) {
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

  const columnsWithActions = React.useMemo<ColumnDef<T>[]>(
    () => [
      ...propColumns,
      {
        id: "actions",
        cell: ({ row }: { row: Row<T> }) =>
          renderRowActions ? (
            renderRowActions(
              row.original,
              handleOpenEditForm,
              handleOpenDeleteDialog
            )
          ) : (
            <DefaultRowActions
              item={row.original}
              onEdit={handleOpenEditForm}
              onDelete={handleOpenDeleteDialog}
            />
          ),
      },
    ],
    [propColumns, handleOpenEditForm, handleOpenDeleteDialog, renderRowActions]
  );

  if (isLoading) {
    return <FullPageLoader text={`Đang tải danh sách ${entityName}...`} />;
  }

  return (
    <>
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
