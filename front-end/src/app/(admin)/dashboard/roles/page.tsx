// src/app/(admin)/dashboard/roles/page.tsx
"use client";

import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2, Shield } from "lucide-react";
import Link from "next/link";

import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import RoleForm from "@/features/user/components/RoleForm";
import { useRoleManagement } from "@/features/user/hooks/useRoleManagement";
import { Role } from "@/features/user/types";
import { RoleFormValues } from "@/features/user/schemas";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Component RowActions tùy chỉnh cho trang Roles
const RoleRowActions = ({
  item,
  onEdit,
  onDelete,
}: {
  item: Role;
  onEdit: (item: Role) => void;
  onDelete: (item: Role) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Hành động</DropdownMenuLabel>
      <DropdownMenuItem asChild>
        <Link href={`/dashboard/roles/${item.id}`}>
          <Shield className="mr-2 h-4 w-4" />
          Phân quyền
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onEdit(item)}>
        <Edit className="mr-2 h-4 w-4" />
        Sửa thông tin
      </DropdownMenuItem>
      <DropdownMenuItem
        className="text-destructive"
        onClick={() => onDelete(item)}
        disabled={(item.users_count ?? 0) > 0}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Xóa
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default function RolesPage() {
  const managementHook = useRoleManagement();

  // Định nghĩa cột trong component để có thể truyền các handlers từ hook
  const roleColumns = useMemo<ColumnDef<Role>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Tên vai trò",
        cell: ({ row }) => (
          <Link
            href={`/dashboard/roles/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "description",
        header: "Mô tả",
        cell: ({ row }) => row.original.description || "N/A",
      },
      {
        accessorKey: "users_count",
        header: "Số người dùng",
        cell: ({ row }) => row.original.users_count ?? 0,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <RoleRowActions
            item={row.original}
            onEdit={managementHook.handleOpenEditForm}
            onDelete={managementHook.handleOpenDeleteDialog}
          />
        ),
      },
    ],
    [managementHook.handleOpenEditForm, managementHook.handleOpenDeleteDialog]
  );

  return (
    <ResourcePageLayout<Role, RoleFormValues>
      title="Vai trò & Phân quyền"
      description="Quản lý các vai trò và gán quyền hạn cho từng vai trò."
      entityName="vai trò"
      columns={roleColumns}
      useManagementHook={useRoleManagement}
      FormComponent={RoleForm}
      toolbarProps={{
        searchColumnId: "name",
        searchPlaceholder: "Tìm theo tên vai trò...",
      }}
    />
  );
}
