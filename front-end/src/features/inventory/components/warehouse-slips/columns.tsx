// src/features/inventory/components/warehouse-slips/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Printer, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { WarehouseSlip } from "../../types";

// Hàm tạo danh sách các cột cho bảng
export const getSlipColumns = (
  onView: (slip: WarehouseSlip) => void,
  onEdit: (slip: WarehouseSlip) => void,
  onDelete: (slip: WarehouseSlip) => void
): ColumnDef<WarehouseSlip>[] => [
  {
    accessorKey: "code",
    header: "Mã Phiếu",
    cell: ({ row }) => <div className="font-medium">{row.original.code}</div>,
  },
  {
    accessorKey: "type",
    header: "Loại Phiếu",
    cell: ({ row }) => {
      const isImport = row.original.type === "IMPORT";
      return (
        <Badge variant={isImport ? "default" : "secondary"}>
          {isImport ? "Nhập kho" : "Xuất kho"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "created_at",
    header: "Ngày Tạo",
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleDateString("vi-VN"),
  },
  {
    accessorKey: "supplier.name",
    header: "Nhà Cung Cấp",
    cell: ({ row }) => row.original.supplier?.name || "N/A",
  },
  {
    accessorKey: "total_amount",
    header: "Tổng Tiền (VND)",
    cell: ({ row }) => {
      const amount = row.original.total_amount;
      return amount ? new Intl.NumberFormat("vi-VN").format(amount) : "N/A";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onView(row.original)}>
            <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(row.original)}>
            <Edit className="mr-2 h-4 w-4" /> Sửa phiếu
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => alert(`In phiếu ${row.original.code}`)}
          >
            <Printer className="mr-2 h-4 w-4" /> In phiếu
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Xóa phiếu
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
