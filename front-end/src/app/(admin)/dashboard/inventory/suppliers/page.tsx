"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link"; // ++ IMPORT LINK ++

import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import SupplierForm from "@/features/inventory/components/suppliers/SupplierForm";
import { useSupplierManagement } from "@/features/inventory/hooks/useSupplierManagement";
import { Supplier } from "@/features/inventory/types";
import { SupplierFormValues } from "@/features/inventory/schemas/supplier.schema";

// ++ CẬP NHẬT CỘT TÊN NHÀ CUNG CẤP ++
const supplierColumns: ColumnDef<Supplier>[] = [
  {
    accessorKey: "name",
    header: "Tên Nhà Cung Cấp",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/inventory/suppliers/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
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
