// src/features/service/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { Service } from "@/features/service/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getPrimaryImageUrl } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import { Category } from "@/features/category/types";

export const serviceColumns: ColumnDef<Service>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
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
    header: "Tên dịch vụ",
    cell: ({ row }) => {
      const primaryImage = getPrimaryImageUrl(
        row.original.images,
        row.original.primary_image_id,
        "/images/placeholder.png"
      );
      return (
        <Link
          href={`/dashboard/services/${row.original.id}`}
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
    meta: { headerTitle: "Tên dịch vụ" },
  },
  {
    accessorKey: "price",
    header: "Giá (VND)",
    cell: ({ row }) =>
      new Intl.NumberFormat("vi-VN").format(row.original.price),
    meta: { headerTitle: "Giá" },
  },
  {
    accessorKey: "duration_minutes",
    meta: { headerTitle: "Thời lượng" },
    header: () => <div className="hidden md:table-cell">Thời lượng (phút)</div>,
    cell: ({ row }) => (
      <div className="hidden md:table-cell">
        {row.original.duration_minutes}
      </div>
    ),
  },
  {
    accessorKey: "categories",
    header: "Danh mục",
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
    meta: { headerTitle: "Danh mục" },
  },
  {
    accessorKey: "is_deleted",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isInactive = row.original.is_deleted;
      const statusText = isInactive ? "Tạm ngưng" : "Hoạt động";
      return (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isInactive ? "bg-muted" : "bg-success"
            )}
          />
          <span>{statusText}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const status = row.original.is_deleted ? "inactive" : "active";
      return value.includes(status);
    },
    meta: { headerTitle: "Trạng thái" },
  },
];
