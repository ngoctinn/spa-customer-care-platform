// src/features/product/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/features/product/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getPrimaryImageUrl } from "@/lib/image-utils";
import { Category } from "@/features/category/types";
import { cn } from "@/lib/utils";

export const productColumns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Tên sản phẩm",
    meta: { headerTitle: "Tên sản phẩm" },
    cell: ({ row }) => {
      const primaryImage = getPrimaryImageUrl(
        row.original.images,
        "/images/placeholder.png"
      );
      return (
        <Link
          href={`/dashboard/products/${row.original.id}/inventory`}
          className="flex items-center gap-3 group"
        >
          <Image
            src={primaryImage}
            alt={row.original.name}
            width={40}
            height={40}
            className="rounded-md object-cover border"
          />
          <span className="font-medium group-hover:underline text-primary">
            {row.original.name}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Giá (VND)",
    meta: { headerTitle: "Giá" },
    cell: ({ row }) =>
      new Intl.NumberFormat("vi-VN").format(row.original.price),
  },
  {
    accessorKey: "stock",
    header: "Tồn kho",
    meta: { headerTitle: "Tồn kho" },
    cell: ({ row }) => {
      const stock = row.original.stock;
      return (
        <Badge variant={stock > 10 ? "outline" : "destructive"}>{stock}</Badge>
      );
    },
  },
  {
    accessorKey: "categories",
    header: "Danh mục",
    meta: { headerTitle: "Danh mục" },
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.categories?.map((cat: Category) => (
          <Badge key={cat.id} variant="secondary">
            {cat.name}
          </Badge>
        ))}
      </div>
    ),
    filterFn: (row, id, value) => {
      const categoryNames = row.original.categories.map((c) => c.name);
      return value.some((val: string) => categoryNames.includes(val));
    },
  },
  {
    accessorKey: "is_deleted",
    header: "Trạng thái",
    meta: { headerTitle: "Trạng thái" },
    cell: ({ row }) => {
      const isInactive = row.original.is_deleted;
      const statusText = isInactive ? "Ngừng bán" : "Đang bán";
      return (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isInactive ? "bg-muted" : "bg-success"
            )}
          ></span>
          <span>{statusText}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const status = row.original.is_deleted ? "inactive" : "active";
      return value.includes(status);
    },
  },
];
