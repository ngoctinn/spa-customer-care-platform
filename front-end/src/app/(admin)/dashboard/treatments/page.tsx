// src/app/(admin)/dashboard/treatments/page.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import TreatmentPlanFormFields from "@/features/treatment/components/TreatmentPlanForm";
import { useTreatmentPlanManagement } from "@/features/treatment/hooks/useTreatmentPlanManagement";
import { TreatmentPlan } from "@/features/treatment/types";
import { TreatmentPlanFormValues } from "@/features/treatment/schemas";
import { getPrimaryImageUrl } from "@/lib/image-utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const columns: ColumnDef<TreatmentPlan>[] = [
  {
    accessorKey: "name",
    header: "Tên liệu trình",
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
    accessorKey: "total_sessions",
    header: "Số buổi",
  },
  {
    accessorKey: "category",
    header: "Danh mục",
    cell: ({ row }) =>
      row.original.category ? (
        <Badge variant="secondary">{row.original.category.name}</Badge>
      ) : null,
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

export default function TreatmentsDashboardPage() {
  return (
    <ResourcePageLayout<TreatmentPlan, TreatmentPlanFormValues>
      title="Quản lý Liệu trình"
      description="Tạo, chỉnh sửa và quản lý các gói liệu trình chuyên sâu."
      entityName="liệu trình"
      columns={columns}
      useManagementHook={useTreatmentPlanManagement}
      FormComponent={TreatmentPlanFormFields}
      toolbarProps={{
        searchColumnId: "name",
        searchPlaceholder: "Lọc theo tên liệu trình...",
      }}
    />
  );
}
