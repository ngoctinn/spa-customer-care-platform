"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Service } from "@/features/service/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPrimaryImageUrl } from "@/lib/image-utils";
import Image from "next/image";

// Helper component cho các hành động trên mỗi dòng
const ServiceRowActions = ({
  service,
  onEdit,
  onDelete,
}: {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Mở menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEdit(service)}>
          <Edit className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => onDelete(service)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Hàm tạo danh sách các cột
export const getServiceColumns = (
  onEdit: (service: Service) => void,
  onDelete: (service: Service) => void
): ColumnDef<Service>[] => [
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
        <div className="flex items-center gap-3">
          <Image
            src={primaryImage}
            alt={row.original.name}
            width={40}
            height={40}
            className="rounded-md object-cover border"
          />
          <span className="font-medium">{row.original.name}</span>
        </div>
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
    header: "Thời lượng (phút)",
    meta: { headerTitle: "Thời lượng" },
  },
  {
    accessorKey: "categories",
    header: "Danh mục",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.categories.map((cat) => (
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
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "active" ? "default" : "destructive"}
      >
        {row.original.status === "active" ? "Hoạt động" : "Tạm ngưng"}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.original.status);
    },
    meta: { headerTitle: "Trạng thái" },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ServiceRowActions
        service={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];
