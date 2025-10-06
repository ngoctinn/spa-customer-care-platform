// src/features/product/components/columns.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Category } from "@/features/category/types";
import { Product } from "@/features/product/types";
import { getPrimaryImageUrl } from "@/lib/image-utils";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, SlidersHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";

// Helper component cho các hành động trên mỗi dòng
const ProductRowActions = ({
  product,
  onEdit,
  onDelete,
  onAdjustStock, // Thêm hàm callback mới
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAdjustStock: (product: Product) => void; // Định nghĩa kiểu
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
        <DropdownMenuItem onClick={() => onEdit(product)}>
          <Edit className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </DropdownMenuItem>
        {/* Nút điều chỉnh tồn kho */}
        <DropdownMenuItem onClick={() => onAdjustStock(product)}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Điều chỉnh tồn kho
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={() => onDelete(product)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Hàm tạo danh sách các cột
export const getProductColumns = (
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void,
  onAdjustStock: (product: Product) => void // Thêm vào tham số
): ColumnDef<Product>[] => [
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
        row.original.primary_image_id,
        "/images/placeholder.png"
      ).trimEnd();
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
        {row.original.categories?.map((cat: Category | string) => {
          const categoryId = typeof cat === "string" ? cat : cat.id;
          const categoryName = typeof cat === "string" ? cat : cat.name;
          return (
            <Badge key={categoryId} variant="secondary">
              {categoryName}
            </Badge>
          );
        })}
      </div>
    ),
    filterFn: (row, id, value) => {
      const categoryNames = row.original.categories.map(
        (cat: Category | string) => (typeof cat === "string" ? cat : cat.name)
      );
      return value.some((val: string) => categoryNames.includes(val));
    },
  },

  {
    accessorKey: "status",
    header: "Trạng thái",
    meta: { headerTitle: "Trạng thái" },
    cell: ({ row }) => (
      <Badge
        variant={row.original.is_deleted === true ? "destructive" : "default"}
      >
        {row.original.is_deleted === true ? "Tạm ngưng" : "Đang sử dụng"}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.original.is_deleted);
    },
  },

  {
    accessorKey: "is_retail",
    header: "loại hình",
    meta: { headerTitle: "Bán lẻ" },
    cell: ({ row }) => (
      <Badge variant={row.original.is_retail ? "default" : "secondary"}>
        {row.original.is_retail ? "Bán lẻ" : "Dịch vụ"}
      </Badge>
    ),
  },

  {
    id: "actions",
    cell: ({ row }) => (
      <ProductRowActions
        product={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdjustStock={onAdjustStock}
      />
    ),
  },
];
