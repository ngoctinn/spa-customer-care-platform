// src/features/user/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Role } from "@/features/user/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Shield } from "lucide-react";

const RoleRowActions = ({
  role,
  onEdit,
  onGoToDetail,
  onDelete,
}: {
  role: Role;
  onEdit: (role: Role) => void;
  onGoToDetail: (roleId: string) => void;
  onDelete: (role: Role) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <span className="sr-only">Mở menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Hành động</DropdownMenuLabel>
      <DropdownMenuItem onClick={() => onGoToDetail(role.id)}>
        <Shield className="mr-2 h-4 w-4" />
        Phân quyền
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onEdit(role)}>
        <Edit className="mr-2 h-4 w-4" />
        Sửa thông tin
      </DropdownMenuItem>
      <DropdownMenuItem
        className="text-destructive"
        onClick={() => onDelete(role)}
        disabled={(role.users_count ?? 0) > 0}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Xóa
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const getRoleColumns = (
  onEdit: (role: Role) => void,
  onGoToDetail: (roleId: string) => void,
  onDelete: (role: Role) => void
): ColumnDef<Role>[] => [
  {
    accessorKey: "name",
    header: "Tên vai trò",
    meta: { headerTitle: "Tên vai trò" },
  },
  {
    accessorKey: "description",
    header: "Mô tả",
    meta: { headerTitle: "Mô tả" },
    cell: ({ row }) => row.original.description || "N/A",
  },
  {
    accessorKey: "users_count",
    header: "Số người dùng",
    meta: { headerTitle: "Số người dùng" },
    cell: ({ row }) => row.original.users_count ?? 0,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <RoleRowActions
        role={row.original}
        onEdit={onEdit}
        onGoToDetail={onGoToDetail}
        onDelete={onDelete}
      />
    ),
  },
];
