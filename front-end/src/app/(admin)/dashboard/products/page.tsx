"use client";
import { ColumnDef } from "@tanstack/react-table";

// --- Import các thành phần cần thiết ---
import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import { Product } from "@/features/product/types";
import { ProductFormValues } from "@/features/product/schemas";
import { useProductManagement } from "@/features/product/hooks/useProductManagement";
import ProductFormFields from "@/features/product/components/ProductForm";

// --- Import các hàm và component cần thiết cho cột ---
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { getPrimaryImageUrl } from "@/lib/image-utils";
import { Category } from "@/features/category/types";
import { cn } from "@/lib/utils";

// --- Định nghĩa các cột (không cần cột Actions) ---
const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Tên sản phẩm",
    cell: ({ row }) => {
      const primaryImage = getPrimaryImageUrl(
        row.original.images,
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
  },
  {
    accessorKey: "price",
    header: "Giá (VND)",
    cell: ({ row }) =>
      new Intl.NumberFormat("vi-VN").format(row.original.price),
  },
  {
    accessorKey: "stock",
    header: "Tồn kho",
    cell: ({ row }) => (
      <Badge variant={row.original.stock > 10 ? "outline" : "destructive"}>
        {row.original.stock}
      </Badge>
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
  },
  {
    accessorKey: "is_deleted",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isInactive = row.original.is_deleted;
      return (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isInactive ? "bg-muted" : "bg-success"
            )}
          ></span>
          <span>{isInactive ? "Ngừng bán" : "Đang bán"}</span>
        </div>
      );
    },
  },
];

export default function ProductsDashboardPage() {
  // Toàn bộ trang giờ chỉ còn là component layout này
  return (
    <ResourcePageLayout<Product, ProductFormValues>
      title="Quản lý Sản phẩm"
      description="Thêm mới, chỉnh sửa và quản lý tất cả sản phẩm của spa."
      entityName="sản phẩm"
      columns={columns}
      useManagementHook={useProductManagement}
      FormComponent={ProductFormFields}
      toolbarProps={{
        searchColumnId: "name",
        searchPlaceholder: "Lọc theo tên sản phẩm...",
      }}
    />
  );
}
