// src/app/(admin)/dashboard/categories/page.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import {
  CategoryFormValues,
  categoryFormSchema,
} from "@/features/category/schemas";
import { Category } from "@/features/category/types";
import { useCategoryManagement } from "@/features/category/hooks/useCategoryManagement";
import CategoryFormFields from "@/features/category/components/CategoryFormFields";
import { Badge } from "@/components/ui/badge";

const typeMap = {
  service: "Dịch vụ",
  product: "Sản phẩm",
  treatment: "Liệu trình",
};

const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Tên danh mục",
  },
  {
    accessorKey: "category_type",
    header: "Loại",
    cell: ({ row }) => <Badge>{typeMap[row.original.category_type]}</Badge>,
  },
];

export default function CategoriesPage() {
  return (
    <ResourcePageLayout<Category, CategoryFormValues>
      title="Quản lý Danh mục"
      description="Tạo, chỉnh sửa và quản lý các danh mục cho sản phẩm, dịch vụ và liệu trình."
      entityName="danh mục"
      columns={columns}
      useManagementHook={useCategoryManagement}
      FormComponent={CategoryFormFields}
      toolbarProps={{
        searchColumnId: "name",
        searchPlaceholder: "Tìm theo tên danh mục...",
      }}
    />
  );
}
