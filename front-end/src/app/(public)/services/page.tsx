// src/app/(public)/services/page.tsx
"use client";

import ServiceCard from "@/features/service/components/ServiceCard";
import { useServices } from "@/features/service/hooks/useServices";
import { Service } from "@/features/service/types";
import { ListPageLayout } from "@/components/layout/public/ListPageLayout";

export default function ServicesPage() {
  return (
    <ListPageLayout<Service>
      title="Khám Phá Dịch Vụ Của Chúng Tôi"
      description="Tìm kiếm liệu trình hoàn hảo dành cho bạn."
      searchPlaceholder="Tìm kiếm dịch vụ..."
      useDataHook={useServices}
      filterFn={(service, searchTerm) =>
        service.name.toLowerCase().includes(searchTerm)
      }
      renderItem={(service) => <ServiceCard service={service} />}
      gridClassName="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
      skeletonCount={6}
    />
  );
}
