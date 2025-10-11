// src/app/(admin)/dashboard/inventory/suppliers/page.tsx (Refactored)
"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";

import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import SupplierForm from "@/features/inventory/components/suppliers/SupplierForm";
import { useSupplierManagement } from "@/features/inventory/hooks/useSupplierManagement";
import { Supplier } from "@/features/inventory/types";
import { SupplierFormValues } from "@/features/inventory/schemas/supplier.schema";

const supplierColumns: ColumnDef<Supplier>[] = [
  { accessorKey: "name", header: "Tên Nhà Cung Cấp" },
  { accessorKey: "contact_person", header: "Người liên hệ" },
  { accessorKey: "phone", header: "Số điện thoại" },
  { accessorKey: "email", header: "Email" },
];

export default function SuppliersPage() {
  return (
    <ResourcePageLayout<Supplier, SupplierFormValues>
      title="Quản lý Nhà Cung Cấp"
      description="Thêm, sửa, xóa thông tin các nhà cung cấp sản phẩm."
      entityName="nhà cung cấp"
      columns={supplierColumns}
      useManagementHook={useSupplierManagement}
      FormComponent={SupplierForm}
      toolbarProps={{
        searchColumnId: "name",
        searchPlaceholder: "Lọc theo tên nhà cung cấp...",
      }}
    />
  );
}
