// src/app/(admin)/dashboard/products/page.tsx
"use client";

import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import { Product } from "@/features/product/types";
import { ProductFormValues } from "@/features/product/schemas";
import { useProductManagement } from "@/features/product/hooks/useProductManagement";
import ProductFormFields from "@/features/product/components/ProductForm";
import { productColumns } from "@/features/product/components/columns";

export default function ProductsDashboardPage() {
  return (
    <ResourcePageLayout<Product, ProductFormValues>
      title="Quản lý Sản phẩm"
      description="Thêm mới, chỉnh sửa và quản lý tất cả sản phẩm của spa."
      entityName="sản phẩm"
      columns={productColumns}
      useManagementHook={useProductManagement}
      FormComponent={ProductFormFields}
      toolbarProps={{
        searchColumnId: "name",
        searchPlaceholder: "Lọc theo tên sản phẩm...",
      }}
    />
  );
}
