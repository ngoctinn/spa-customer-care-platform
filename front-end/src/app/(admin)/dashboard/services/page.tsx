// src/app/(admin)/dashboard/services/page.tsx (Refactored)
"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

// --- Import các thành phần chung & cần thiết ---
import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import ServiceFormFields from "@/features/service/components/ServiceForm";
import { useServiceManagement } from "@/features/service/hooks/useServiceManagement";
import { Service } from "@/features/service/types";
import { ServiceFormValues } from "@/features/service/schemas";
import { getPrimaryImageUrl } from "@/lib/image-utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCategories } from "@/features/category/hooks/useCategories";
import { Category } from "@/features/category/types";

// --- Định nghĩa cột ngay tại đây (không cần file riêng) ---
// (Lưu ý: Không còn cột Actions)
const serviceColumns: ColumnDef<Service>[] = [
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
  },
  {
    accessorKey: "price",
    header: "Giá (VND)",
    cell: ({ row }) =>
      new Intl.NumberFormat("vi-VN").format(row.original.price),
  },
  {
    accessorKey: "duration_minutes",
    header: "Thời lượng (phút)",
    cell: ({ row }) => <div>{row.original.duration_minutes}</div>,
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
          />
          <span>{isInactive ? "Tạm ngưng" : "Hoạt động"}</span>
        </div>
      );
    },
  },
];

export default function ServicesDashboardPage() {
  // Component giờ chỉ là một lời gọi duy nhất!
  return (
    <ResourcePageLayout<Service, ServiceFormValues>
      title="Quản lý Dịch vụ"
      description="Thêm mới, chỉnh sửa và quản lý tất cả dịch vụ của spa."
      entityName="dịch vụ"
      columns={serviceColumns}
      useManagementHook={useServiceManagement}
      FormComponent={ServiceFormFields}
      toolbarProps={{
        searchColumnId: "name",
        searchPlaceholder: "Lọc theo tên dịch vụ...",
      }}
    />
  );
}
