// src/app/(admin)/dashboard/staffs/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { useStaffManagement } from "@/features/staff/hooks/useStaffManagement";
import { FullStaffProfile } from "@/features/staff/types";
import { StaffFormValues } from "@/features/staff/schemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/data-table/data-table";
import { Button } from "@/components/ui/button";
import { FullPageLoader } from "@/components/ui/spinner";
import { getStaffColumns } from "@/features/staff/components/columns"; // Import columns
import StaffOnboardingWizard from "@/features/staff/components/StaffOnboardingWizard";

export default function StaffPage() {
  const {
    data: staffList,
    isLoading,
    handleOpenEditForm,
    handleOpenDeleteDialog,
    // Các phần khác của hook không còn cần thiết trực tiếp ở đây
  } = useStaffManagement();

  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Vẫn sử dụng columns cũ để hiển thị danh sách
  const columns = useMemo<ColumnDef<FullStaffProfile>[]>(
    () => getStaffColumns(handleOpenEditForm, handleOpenDeleteDialog),
    [handleOpenEditForm, handleOpenDeleteDialog]
  );

  // Tạm thời chưa triển khai lại form sửa nhanh, sẽ cần logic riêng
  // vì ResourcePageLayout không còn được dùng.
  // Bạn có thể mở một dialog khác với `StaffForm` cũ nếu muốn.

  if (isLoading) {
    return <FullPageLoader text="Đang tải danh sách nhân viên..." />;
  }

  return (
    <>
      <PageHeader
        title="Quản lý nhân viên"
        description="Thêm mới, chỉnh sửa và quản lý thông tin các nhân viên."
        actionNode={
          <Button onClick={() => setIsWizardOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm nhân viên mới
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={staffList}
        toolbarProps={{
          searchColumnId: "full_name",
          searchPlaceholder: "Lọc theo tên nhân viên...",
        }}
      />

      {/* Onboarding Wizard Dialog */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Thêm nhân viên mới</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <StaffOnboardingWizard onClose={() => setIsWizardOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Các Dialog cho việc Sửa/Xóa có thể được thêm lại ở đây nếu cần */}
    </>
  );
}
