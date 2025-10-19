/**
 * @file src/features/promotion/components/PromotionsDataTable.tsx
 * @description Định nghĩa các cột cho bảng dữ liệu khuyến mãi.
 */

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Promotion } from "@/features/promotion/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header";

export const columns: ColumnDef<Promotion>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên Khuyến Mãi" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "discount_percentage",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giảm Giá (%)" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("discount_percentage")}%</div>
    ),
  },
  {
    accessorKey: "start_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày Bắt Đầu" />
    ),
    cell: ({ row }) =>
      format(new Date(row.getValue("start_date")), "dd/MM/yyyy"),
  },
  {
    accessorKey: "end_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày Kết Thúc" />
    ),
    cell: ({ row }) => format(new Date(row.getValue("end_date")), "dd/MM/yyyy"),
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng Thái" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      return (
        <Badge variant={isActive ? "success" : "destructive"}>
          {isActive ? "Đang hoạt động" : "Hết hạn"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];
