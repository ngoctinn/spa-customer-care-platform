// src/features/inventory/components/suppliers/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Supplier } from "@/features/inventory/types";

export const supplierColumns: ColumnDef<Supplier>[] = [
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
