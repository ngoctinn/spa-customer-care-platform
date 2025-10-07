// src/features/staff/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  CalendarClock,
  Link,
} from "lucide-react";
import { FullStaffProfile } from "@/features/staff/types";
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
import { cn } from "@/lib/utils";

// Component này giờ chỉ nhận props và gọi hàm, không quản lý state
const StaffRowActions = ({
  staff,
  onEdit,
  onDelete,
}: {
  staff: FullStaffProfile;
  onEdit: (staff: FullStaffProfile) => void;
  onDelete: (staff: FullStaffProfile) => void;
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
        <DropdownMenuItem onClick={() => onEdit(staff)}>
          <Edit className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/staff/${staff.id}/schedule`}>
            <CalendarClock className="mr-2 h-4 w-4" />
            Quản lý lịch
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={() => onDelete(staff)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Xuất ra một hàm để tạo columns, giúp truyền các hàm xử lý từ page vào
export const getStaffColumns = (
  onEdit: (staff: FullStaffProfile) => void,
  onDelete: (staff: FullStaffProfile) => void
): ColumnDef<FullStaffProfile>[] => [
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
    accessorKey: "full_name",
    header: "Họ và tên",
    meta: { headerTitle: "Họ và tên" },
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { headerTitle: "Email" },
  },
  {
    accessorKey: "phone",
    header: "Số điện thoại",
    cell: ({ row }) => row.getValue("phone") || "N/A",
    meta: { headerTitle: "Số điện thoại" },
  },
  {
    accessorKey: "roles",
    header: "Vai trò",
    cell: ({ row }) => {
      const roles = row.original.roles;
      if (!roles || roles.length === 0) {
        return <Badge variant="outline">Chưa có vai trò</Badge>;
      }
      return <Badge>{roles[0].name}</Badge>;
    },
    filterFn: (row, id, value) => {
      const roleName = row.original.roles[0]?.name;
      return value.includes(roleName);
    },
    meta: { headerTitle: "Vai trò" },
  },
  {
    accessorKey: "is_active",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      return (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isActive ? "bg-success" : "bg-muted"
            )}
          />
          <span>{isActive ? "Hoạt động" : "Tạm ngưng"}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const isActive = row.getValue(id) ? "active" : "inactive";
      return value.includes(isActive);
    },
    meta: { headerTitle: "Trạng thái" },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <StaffRowActions
        staff={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];
