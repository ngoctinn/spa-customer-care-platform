// src/app/(admin)/dashboard/services/page.tsx
"use client";

import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import ServiceFormFields from "@/features/service/components/ServiceForm";
import { useServiceManagement } from "@/features/service/hooks/useServiceManagement";
import { Service } from "@/features/service/types";
import { ServiceFormValues } from "@/features/service/schemas";
import { serviceColumns } from "@/features/service/components/columns";

export default function ServicesDashboardPage() {
  return (
    <ResourcePageLayout<Service, ServiceFormValues>
      title="Quản lý Dịch vụ"
      description="Thêm mới, chỉnh sửa và quản lý tất cả dịch vụ của spa."
      entityName="dịch vụ"
      columns={serviceColumns}
      useManagementHook={useServiceManagement}
      FormComponent={ServiceFormFields}
      toolbarProps={{
        searchColumnId: "name",
        searchPlaceholder: "Lọc theo tên dịch vụ...",
      }}
    />
  );
}
