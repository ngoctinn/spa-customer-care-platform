// src/app/(admin)/dashboard/staff/page.tsx (Refactored)
"use client";

import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { MoreHorizontal, Edit, Trash2, CalendarClock } from "lucide-react";

import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import StaffForm from "@/features/staff/components/StaffForm";
import { useStaffManagement } from "@/features/staff/hooks/useStaffManagement";
import { FullStaffProfile } from "@/features/staff/types";
import { StaffFormValues } from "@/features/staff/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Component RowActions tùy chỉnh cho Staff
const StaffRowActions = ({
  item,
  onEdit,
  onDelete,
}: {
  item: FullStaffProfile;
  onEdit: (item: FullStaffProfile) => void;
  onDelete: (item: FullStaffProfile) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Hành động</DropdownMenuLabel>
      <DropdownMenuItem onClick={() => onEdit(item)}>
        <Edit className="mr-2 h-4 w-4" />
        Chỉnh sửa
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href={`/dashboard/staff/${item.id}/schedule`}>
          <CalendarClock className="mr-2 h-4 w-4" />
          Quản lý lịch
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem
        className="text-destructive"
        onClick={() => onDelete(item)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Xóa
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default function StaffPage() {
  const managementHook = useStaffManagement();

  const staffColumns = useMemo<ColumnDef<FullStaffProfile>[]>(
    () => [
      { accessorKey: "full_name", header: "Họ và tên" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "phone",
        header: "Số điện thoại",
        cell: ({ row }) => row.original.phone || "N/A",
      },
      {
        accessorKey: "roles",
        header: "Vai trò",
        cell: ({ row }) => {
          const roles = row.original.roles;
          return roles?.length > 0 ? (
            <Badge>{roles[0].name}</Badge>
          ) : (
            <Badge variant="outline">Chưa có</Badge>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "Trạng thái",
        cell: ({ row }) => {
          const isActive = row.original.is_active;
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
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <StaffRowActions
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
    <ResourcePageLayout<FullStaffProfile, StaffFormValues>
      title="Quản lý nhân viên"
      description="Thêm mới, chỉnh sửa và quản lý thông tin các nhân viên."
      entityName="nhân viên"
      columns={staffColumns}
      useManagementHook={useStaffManagement}
      FormComponent={StaffForm}
      toolbarProps={{
        searchColumnId: "full_name",
        searchPlaceholder: "Lọc theo tên nhân viên...",
      }}
    />
  );
}
