// src/features/inventory/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { MoreHorizontal, History, SlidersHorizontal } from "lucide-react";
import { Product } from "@/features/product/types";
import { getPrimaryImageUrl } from "@/lib/image-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Component Actions cho mỗi dòng
const InventoryRowActions = ({
  product,
  onAdjustStock,
  onViewHistory,
}: {
  product: Product;
  onAdjustStock: (product: Product) => void;
  onViewHistory: (product: Product) => void;
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
        <DropdownMenuItem onClick={() => onAdjustStock(product)}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Điều chỉnh tồn kho
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewHistory(product)}>
          <History className="mr-2 h-4 w-4" />
          Xem lịch sử
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Định nghĩa các cột
export const getInventoryColumns = (
  onAdjustStock: (product: Product) => void,
  onViewHistory: (product: Product) => void
): ColumnDef<Product>[] => [
  {
    accessorKey: "name",
    header: "Sản phẩm",
    cell: ({ row }) => {
      const product = row.original;
      const primaryImage = getPrimaryImageUrl(
        product.images,
        product.primary_image_id
      );
      return (
        <div className="flex items-center gap-3">
          <Image
            src={primaryImage}
            alt={product.name}
            width={40}
            height={40}
            className="rounded-md object-cover border bg-white p-1"
          />
          <span className="font-medium">{product.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "stock",
    header: "Tồn kho",
    cell: ({ row }) => {
      const stock = row.original.stock;
      return <span className="font-mono text-lg">{stock}</span>;
    },
  },
  {
    id: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const stock = row.original.stock;
      if (stock <= 0) {
        return <Badge variant="destructive">Hết hàng</Badge>;
      }
      if (stock <= 10) {
        // Ngưỡng cảnh báo, có thể cấu hình sau
        return (
          <Badge variant="secondary" className="bg-yellow-500 text-black">
            Sắp hết
          </Badge>
        );
      }
      return (
        <Badge variant="default" className="bg-green-600">
          Còn hàng
        </Badge>
      );
    },
  },
  {
    accessorKey: "base_unit",
    header: "Đơn vị",
    cell: ({ row }) => row.original.base_unit,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <InventoryRowActions
        product={row.original}
        onAdjustStock={onAdjustStock}
        onViewHistory={onViewHistory}
      />
    ),
  },
];
