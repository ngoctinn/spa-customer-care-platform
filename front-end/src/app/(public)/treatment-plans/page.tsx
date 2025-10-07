// src/app/(public)/treatment-plans/page.tsx
"use client";

import TreatmentPlanCard from "@/features/treatment/components/TreatmentPlanCard";
import { useTreatmentPlans } from "@/features/treatment/hooks/useTreatmentPlans";
import { TreatmentPlan } from "@/features/treatment/types";
import { ListPageLayout } from "@/components/layout/public/ListPageLayout";

export default function TreatmentPlansPage() {
  return (
    <ListPageLayout<TreatmentPlan>
      title="Khám Phá Các Gói Liệu Trình"
      description="Đầu tư vào vẻ đẹp dài lâu với các gói liệu trình chuyên sâu, được thiết kế để mang lại hiệu quả tối ưu."
      searchPlaceholder="Tìm kiếm liệu trình..."
      useDataHook={useTreatmentPlans}
      filterFn={(plan, searchTerm) =>
        plan.name.toLowerCase().includes(searchTerm)
      }
      renderItem={(plan) => <TreatmentPlanCard plan={plan} />}
      gridClassName="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
      skeletonCount={6}
    />
  );
}
