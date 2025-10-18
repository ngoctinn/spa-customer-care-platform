import { ColumnDef, Table } from "@tanstack/react-table";
import { UseFormReturn, FieldValues } from "react-hook-form";
import React from "react";

// Kiểu dữ liệu cho kết quả trả về của một hook quản lý tài nguyên (ví dụ: useProductManagement)
export interface UseManagementHookResult<T, TFormValues extends FieldValues> {
  data: T[];
  isLoading: boolean;
  form: UseFormReturn<TFormValues>;
  isFormOpen: boolean;
  editingItem: T | null;
  itemToDelete: T | null;
  isSubmitting: boolean;
  handleOpenAddForm: () => void;
  handleOpenEditForm: (item: T) => void;
  handleCloseForm: () => void;
  handleFormSubmit: (data: TFormValues) => void;
  handleOpenDeleteDialog: (item: T) => void;
  handleCloseDeleteDialog: () => void;
  handleConfirmDelete: () => void;
}

// Kiểu dữ liệu cho props của component ResourcePageLayout
export interface ResourcePageLayoutProps<
  T extends { id: string; name?: string },
  TFormValues extends FieldValues
> {
  // --- Cấu hình chung ---
  title: string;
  description: string;
  entityName: string; // ví dụ: "sản phẩm", "vai trò"

  // --- Cấu hình DataTable ---
  columns: ColumnDef<T>[];
  toolbarProps?: {
    searchColumnId: string;
    searchPlaceholder: string;
    CustomActions?: React.ComponentType<{ table: Table<T> }>;
    // Thêm các props khác cho toolbar nếu cần
  };

  // --- Logic & Form ---
  useManagementHook: () => UseManagementHookResult<T, TFormValues>;
  FormComponent: React.ComponentType; // Component Form để thêm/sửa
}
