/**
 * @file src/app/(admin)/dashboard/promotions/page.tsx
 * @description Trang quản lý khuyến mãi.
 */

"use client";

import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import { usePromotionManagement } from "@/features/promotion/hooks/usePromotionManagement";
import { columns } from "@/features/promotion/components/PromotionsDataTable";
import { PromotionForm } from "@/features/promotion/components/PromotionForm";

export default function PromotionsPage() {
  return (
    <ResourcePageLayout
      title="Quản lý Khuyến Mãi"
      description="Thêm mới, chỉnh sửa và quản lý các chương trình khuyến mãi."
      entityName="khuyến mãi"
      useManagementHook={usePromotionManagement}
      columns={columns}
      FormComponent={PromotionForm}
      toolbarProps={{
        searchColumnId: "name",
        searchPlaceholder: "Lọc theo tên khuyến mãi...",
      }}
    />
  );
}