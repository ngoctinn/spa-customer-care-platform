// src/app/(admin)/dashboard/staffs/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
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
import { Button } from "@/components/ui/button";
import StaffOnboardingWizard from "@/features/staff/components/StaffOnboardingWizard";
import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import StaffForm from "@/features/staff/components/StaffForm";
import { getStaffColumns } from "@/features/staff/components/columns";

export default function StaffPage() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const managementHook = useStaffManagement();

  const columns = useMemo(
    () =>
      getStaffColumns(
        managementHook.handleOpenEditForm,
        managementHook.handleOpenDeleteDialog
      ),
    [managementHook.handleOpenEditForm, managementHook.handleOpenDeleteDialog]
  );

  return (
    <>
      <ResourcePageLayout<FullStaffProfile, StaffFormValues>
        title="Quản lý nhân viên"
        description="Thêm mới, chỉnh sửa và quản lý thông tin các nhân viên."
        entityName="nhân viên"
        columns={columns}
        useManagementHook={useStaffManagement}
        FormComponent={StaffForm} // Pass the reusable form component
        toolbarProps={{
          searchColumnId: "full_name",
          searchPlaceholder: "Lọc theo tên nhân viên...",
        }}
      />

      {/* Onboarding Wizard Dialog - This remains custom */}
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
    </>
  );
}
