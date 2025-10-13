// src/app/(admin)/dashboard/promotions/page.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import { Promotion } from "@/features/promotion/types";
import { PromotionFormValues } from "@/features/promotion/schemas";
import { usePromotionManagement } from "@/features/promotion/hooks/usePromotionManagement";
import PromotionForm from "@/features/promotion/components/PromotionForm";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Định nghĩa các cột cho bảng dữ liệu
const columns: ColumnDef<Promotion>[] = [
  {
    accessorKey: "title",
    header: "Tiêu đề",
  },
  {
    accessorKey: "discount_percent",
    header: "Giảm giá",
    cell: ({ row }) => (
      <Badge variant="destructive">-{row.original.discount_percent}%</Badge>
    ),
  },
  {
    accessorKey: "start_date",
    header: "Ngày bắt đầu",
    cell: ({ row }) => format(new Date(row.original.start_date), "dd/MM/yyyy"),
  },
  {
    accessorKey: "end_date",
    header: "Ngày kết thúc",
    cell: ({ row }) => format(new Date(row.original.end_date), "dd/MM/yyyy"),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const now = new Date();
      const startDate = new Date(row.original.start_date);
      const endDate = new Date(row.original.end_date);
      let status: "active" | "scheduled" | "inactive" = "inactive";
      let statusText = "Đã kết thúc";
      let statusClass = "bg-muted";

      if (now >= startDate && now <= endDate) {
        status = "active";
        statusText = "Đang diễn ra";
        statusClass = "bg-success";
      } else if (now < startDate) {
        status = "scheduled";
        statusText = "Sắp diễn ra";
        statusClass = "bg-info";
      }

      return (
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", statusClass)} />
          <span>{statusText}</span>
        </div>
      );
    },
  },
];

export default function PromotionsPage() {
  return (
    <ResourcePageLayout<Promotion, PromotionFormValues>
      title="Quản lý Khuyến mãi"
      description="Tạo, chỉnh sửa và quản lý các chương trình khuyến mãi."
      entityName="khuyến mãi"
      columns={columns}
      useManagementHook={usePromotionManagement}
      FormComponent={PromotionForm}
      toolbarProps={{
        searchColumnId: "title",
        searchPlaceholder: "Tìm theo tiêu đề khuyến mãi...",
      }}
    />
  );
}
