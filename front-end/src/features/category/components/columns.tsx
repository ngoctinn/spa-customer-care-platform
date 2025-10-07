"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Category } from "@/features/category/types";
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

// Component Actions cho mỗi dòng
const CategoryRowActions = ({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
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
        <DropdownMenuItem onClick={() => onEdit(category)}>
          <Edit className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => onDelete(category)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Hàm tạo danh sách các cột
export const getCategoryColumns = (
  onEdit: (category: Category) => void,
  onDelete: (category: Category) => void
): ColumnDef<Category>[] => [
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
    header: "Tên danh mục",
    meta: { headerTitle: "Tên danh mục" },
  },
  {
    accessorKey: "type",
    header: "Loại",
    meta: { headerTitle: "Loại" },
    cell: ({ row }) => {
      const type = row.original.type;
      let text: string;
      switch (type) {
        case "service":
          text = "Dịch vụ";
          break;
        case "product":
          text = "Sản phẩm";
          break;
        case "treatment":
          text = "Liệu trình";
          break;
        default:
          text = "Chưa xác định";
      }
      return <Badge variant="outline">{text}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.type);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CategoryRowActions
        category={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];
